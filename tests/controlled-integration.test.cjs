const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");

const projectRoot = process.env.DATACENTER_TEST_SOURCE_ROOT || path.resolve(__dirname, "..");

class Element {
  constructor() {
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  querySelector(selector) {
    assert.equal(selector, "tbody");
    return this.tbody || (this.tbody = new Element());
  }
}

function country(name, tradeValue, price = 0.1, mix = 20) {
  return {
    country: name,
    business_price_usd_per_kwh: price,
    total_energy_consumption_exajoules: 1,
    electricity_generation_solar_pct: mix,
    electricity_generation_wind_pct: 0,
    electricity_generation_hydro_pct: 0,
    electricity_net_imports_twh: tradeValue
  };
}

async function runFrontend(countries) {
  const nodes = Object.fromEntries(
    ["main", "#country-data", "#candidate-shortlist", "climate-data"].map(id => [id, new Element()])
  );
  const logs = [];
  const errors = [];
  const requests = [];
  const context = vm.createContext({
    document: {
      createElement: () => new Element(),
      querySelector: id => nodes[id],
      getElementById: id => nodes[id]
    },
    window: { location: { port: "" } },
    console: { log: (...args) => logs.push(args), error: (...args) => errors.push(args) },
    fetch: async url => {
      requests.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => url.includes("/api/screening/energy")
          ? { countries: structuredClone(countries) }
          : { candidates: [] }
      };
    }
  });
  vm.runInContext(fs.readFileSync(path.join(projectRoot, "website/app.js"), "utf8"), context);
  await new Promise(resolve => setImmediate(resolve));
  const table = nodes["#country-data"].children[0];
  return { nodes, logs, errors, requests, rows: table ? table.tbody.children : [] };
}

const tradeCases = [
  ["null", null, "Unknown", "Unknown"],
  ["missing field", undefined, "Unknown", "Unknown"],
  ["empty string", "", "Unknown", "Unknown"],
  ["numeric zero", 0, "Balanced (0.00 TWh)", "Balanced / No Net Trade"],
  ["string zero", "0", "Balanced (0.00 TWh)", "Balanced / No Net Trade"],
  ["positive", 2.5, "Net Importer (+2.50 TWh)", "Net Importer"],
  ["negative", -2.5, "Net Exporter (-2.50 TWh)", "Net Exporter"]
];
for (const [label, value, display, classification] of tradeCases) {
  test(`trade data: ${label}`, async () => {
    const result = await runFrontend([
      country("Alpha", 0), country("Beta", 0, 0.2, 30), country("Gamma", 0, 0.3, 40),
      country("TradeCase", value, 0.4, 50)
    ]);
    assert.equal(result.errors.length, 0);
    const row = result.rows.find(row => row.innerHTML.includes("<td>TradeCase</td>"));
    assert.ok(row, "Country must remain visible");
    assert.ok(row.innerHTML.includes(`<td>${display}</td>`), row.innerHTML);
    const tradeLog = result.logs.find(args => args[0] === "Electricity Trade Position:");
    assert.equal(tradeLog[1].find(row => row.country === "TradeCase").tradePosition, classification);
  });
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      fields.push(field); field = "";
    } else field += char;
  }
  fields.push(field);
  return fields;
}

test("reviewed dataset keeps its three-country shortlist and same-origin API request", async () => {
  const lines = fs.readFileSync(path.join(projectRoot, "data/energy-data.csv"), "utf8").trim().split(/\r?\n/);
  const columns = parseCsvLine(lines.shift());
  const numericFields = ["business_price_usd_per_kwh", "total_energy_consumption_exajoules",
    "electricity_generation_solar_pct", "electricity_generation_wind_pct",
    "electricity_generation_hydro_pct", "electricity_net_imports_twh"];
  const countries = lines.map(line => {
    const fields = parseCsvLine(line);
    const record = Object.fromEntries(columns.map((name, i) => [name, fields[i]]));
    const projected = { country: record.country };
    for (const name of numericFields) projected[name] = record[name] === "" ? null : Number(record[name]);
    return projected;
  });
  assert.equal(countries.length, 15);
  assert.equal(columns.length, 49);
  const result = await runFrontend(countries);
  assert.equal(result.errors.length, 0);
  assert.equal(result.rows.length, 15);
  const shortlist = result.logs.find(args => args[0] === "Initial Three-Country Shortlist:")[1];
  assert.deepEqual(JSON.parse(JSON.stringify(shortlist)), {
    costOriented: "Indonesia", mixOriented: "Brazil", balanced: "Canada"
  });
  assert.ok(result.requests.includes("/api/screening/energy"));
});

let workerModule;
async function loadWorker() {
  if (!workerModule) {
    const source = fs.readFileSync(path.join(projectRoot, "backend/worker.js"), "utf8")
      .replace(/from "(\.\/[^"]+\.mjs)"/g, (_match, relative) =>
        "from " + JSON.stringify(pathToFileURL(path.resolve(projectRoot, "backend", relative)).href));
    workerModule = import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  }
  return workerModule;
}

function identityRequest(headers = {}, body = {}) {
  return new Request("https://sites.example/api/ai/adviser", {
    method: "POST", headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
}

function mockUsers(user, failure) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      if (failure) throw new Error("Mocked database failure");
      assert.match(sql, /FROM\s+users\s+WHERE\s+authenticated_user_id\s*=\s*\?/i);
      const call = { sql, parameters: [] };
      calls.push(call);
      return {
        bind(...parameters) { call.parameters = parameters; return this; },
        async first() { return user; }
      };
    }
  };
}

test("authorization guard rejects missing dispatch identity without querying D1", async () => {
  const { requireAiAdviserUser } = await loadWorker();
  const DB = mockUsers(null);
  const access = await requireAiAdviserUser(identityRequest(), { DB });
  assert.equal(access.response.status, 401);
  assert.equal((await access.response.json()).error, "AuthenticationRequired");
  assert.equal(access.user, null);
  assert.equal(DB.calls.length, 0);
});

test("authorization guard ignores client body, query and alternative identity headers", async () => {
  const { requireAiAdviserUser } = await loadWorker();
  const request = new Request("https://sites.example/api/ai/adviser?authenticated_user_id=client-user", {
    method: "POST", headers: { "Content-Type": "application/json", "X-User-Id": "client-user", "X-Role": "team_admin" },
    body: JSON.stringify({ authenticated_user_id: "client-user", email: "client@example.test", role: "team_admin" })
  });
  const DB = mockUsers({ role: "team_admin" });
  const access = await requireAiAdviserUser(request, { DB });
  assert.equal(access.response.status, 401);
  assert.equal(DB.calls.length, 0);
  assert.equal(request.bodyUsed, false);
});

test("authorization guard requires an application registration record", async () => {
  const { requireAiAdviserUser } = await loadWorker();
  const DB = mockUsers(null);
  const access = await requireAiAdviserUser(identityRequest({ "oai-authenticated-user-id": "sites-user" }), { DB });
  assert.equal(access.response.status, 403);
  assert.equal((await access.response.json()).error, "RegistrationRequired");
  assert.deepEqual(DB.calls[0].parameters, ["sites-user"]);
});

for (const role of ["registered", "editor", "team_admin"]) {
  test(`authorization guard permits the existing ${role} role`, async () => {
    const { requireAiAdviserUser } = await loadWorker();
    const user = { id: 1, authenticated_user_id: "sites-user", role };
    const DB = mockUsers(user);
    const request = identityRequest({ "oai-authenticated-user-id": "sites-user" });
    const access = await requireAiAdviserUser(request, { DB });
    assert.equal(access.response, null);
    assert.equal(access.user, user);
    assert.deepEqual(DB.calls[0].parameters, ["sites-user"]);
    assert.equal(request.bodyUsed, false);
  });
}

for (const role of ["viewer", "admin", "REGISTERED", undefined]) {
  test(`authorization guard denies ${String(role)} using the database role`, async () => {
    const { requireAiAdviserUser } = await loadWorker();
    const DB = mockUsers({ id: 1, authenticated_user_id: "sites-user", role });
    const request = identityRequest({ "oai-authenticated-user-id": "sites-user" }, { role: "team_admin" });
    const access = await requireAiAdviserUser(request, { DB });
    assert.equal(access.response.status, 403);
    assert.equal((await access.response.json()).error, "Forbidden");
    assert.equal(access.user, null);
  });
}

test("authorization guard uses parameterized stable ID rather than email", async () => {
  const { requireAiAdviserUser } = await loadWorker();
  const id = "sites-user' OR 1=1 --";
  const DB = mockUsers(null);
  const access = await requireAiAdviserUser(identityRequest({
    "oai-authenticated-user-id": id, "oai-authenticated-user-email": "other@example.test"
  }), { DB });
  assert.equal(access.response.status, 403);
  assert.deepEqual(DB.calls[0].parameters, [id]);
  assert.ok(!DB.calls[0].sql.includes(id));
  assert.ok(!DB.calls[0].sql.includes("other@example.test"));
});

for (const [label, env] of [["missing binding", {}], ["lookup failure", { DB: mockUsers(null, true) }]]) {
  test(`authorization guard fails closed on ${label}`, async () => {
    const { requireAiAdviserUser } = await loadWorker();
    const access = await requireAiAdviserUser(identityRequest({ "oai-authenticated-user-id": "sites-user" }), env);
    assert.equal(access.response.status, 503);
    assert.equal((await access.response.json()).error, "AuthorizationUnavailable");
    assert.equal(access.user, null);
  });
}

test("public dev diagnostics remain absent", async () => {
  const { default: worker } = await loadWorker();
  for (const route of ["/api/dev/sites-identity", "/api/dev/user", "/api/dev/protected-ai"]) {
    const response = await worker.fetch(new Request("https://sites.example" + route, { method: "POST" }), {});
    assert.equal(response.status, 404, route);
  }
});
