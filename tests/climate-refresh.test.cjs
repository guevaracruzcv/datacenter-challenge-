const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "..");
const workerSource = fs.readFileSync(path.join(root, "backend/worker.js"), "utf8")
  .replace(/from "(\.\/[^"]+\.mjs)"/g, (_match, relative) =>
    "from " + JSON.stringify(pathToFileURL(path.resolve(root, "backend", relative)).href));
const workerPromise = import("data:text/javascript;base64," + Buffer.from(workerSource).toString("base64"));

// Synthetic complete-year data, not actual climate evidence.
function payload() {
  return {
    latitude: -15.782073, longitude: -47.88678,
    hourly_units: { temperature_2m: "°C", relative_humidity_2m: "%" },
    hourly: {
      time: Array.from({ length: 8760 }, (_, i) => new Date(Date.UTC(2025, 0, 1) + i * 3600000).toISOString().slice(0, 16)),
      temperature_2m: Array(8760).fill(20), relative_humidity_2m: Array(8760).fill(70)
    }
  };
}

function database(role = "editor") {
  const previous = ["mean_temperature_c", "min_temperature_c", "max_temperature_c", "mean_relative_humidity_pct", "observation_count"]
    .map((field, i) => ({ country: "Brazil", metric_name: "climate_" + field, value: [19, 10, 30, 60, 8760][i],
      source_id: 1, source_url: "https://archive-api.open-meteo.com/v1/archive",
      retrieved_at: "2026-10-01", notes: JSON.stringify({ reference_location: "Brasilia", limitation: "Synthetic previous snapshot." }) }));
  const calls = [];
  const batches = [];
  const DB = {
    saved: structuredClone(previous), previous,
    prepare(sql) {
      const statement = { sql, values: [], bind(...values) { this.values = values; return this; } };
      calls.push(statement);
      statement.first = async () => {
        if (/FROM\s+users/.test(sql)) return role ? { authenticated_user_id: "climate-test-user", role } : null;
        if (/SELECT id FROM countries/.test(sql)) return DB.missingCountry ? null : { id: 7 };
        throw new Error("Unexpected first");
      };
      statement.all = async () => ({ results: DB.saved.filter(row => row.source_id === Math.max(...DB.saved.map(item => item.source_id))) });
      return statement;
    },
    async batch(statements) {
      batches.push(statements);
      if (DB.failBatch) throw new Error("Synthetic batch rollback");
      assert.equal(statements.length, 6);
      const [name, url, retrieved, notes] = statements[0].values;
      assert.match(statements[0].sql, /INSERT INTO sources/);
      const rows = statements.slice(1).map(statement => {
        assert.match(statement.sql, /INSERT INTO metrics/);
        const [countryId, metric, value, unit, limitation, sourceName, sourceNotes] = statement.values;
        assert.equal(countryId, 7);
        assert.equal(sourceName, name);
        assert.equal(sourceNotes, notes);
        assert.equal((statement.sql.match(/\?/g) || []).length, statement.values.length);
        assert.match(statement.sql, /'calculation'/);
        return { country: "Brazil", metric_name: metric, value, unit, source_id: 2,
          source_url: url, retrieved_at: retrieved, notes };
      });
      DB.saved.push(...rows);
      return statements.map(() => ({ success: true }));
    }
  };
  return { DB, calls, batches, env: { DB } };
}

async function refresh(f, body = { country: "Brazil" }, identity = true) {
  const { default: worker } = await workerPromise;
  return worker.fetch(new Request("https://site.example/api/evidence/climate/refresh", {
    method: "POST", headers: { "Content-Type": "application/json", ...(identity ? { "oai-authenticated-user-id": "climate-test-user" } : {}) },
    body: JSON.stringify(body)
  }), f.env);
}

function mockSource(t, data = payload(), status = 200) {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    const parsed = new URL(url);
    assert.equal(parsed.origin, "https://archive-api.open-meteo.com");
    assert.equal(parsed.searchParams.get("start_date"), "2025-01-01");
    assert.equal(parsed.searchParams.get("end_date"), "2025-12-31");
    assert.equal(options.redirect, "error");
    return Response.json(data, { status });
  });
  return calls;
}

test("reference locations match the unchanged reviewed climate summary", async () => {
  const { references } = await import(pathToFileURL(path.join(root, "backend/climate.mjs")).href);
  const baseline = JSON.parse(fs.readFileSync(path.join(root, "data/climate/climate_summary.json"), "utf8"));
  for (const candidate of baseline.candidates) {
    assert.deepEqual(references[candidate.country], { location: candidate.reference_location, latitude: candidate.latitude, longitude: candidate.longitude });
    assert.equal(candidate.period, "2025");
  }
});

for (const role of ["registered", "viewer", null]) {
  test("refresh denies " + (role || "unregistered") + " without fetch or writes", async t => {
    const f = database(role);
    const upstream = mockSource(t);
    assert.equal((await refresh(f)).status, 403);
    assert.equal(upstream.length, 0);
    assert.equal(f.batches.length, 0);
    assert.deepEqual(f.DB.saved, f.DB.previous);
  });
}

test("anonymous refresh rejects before database or upstream", async t => {
  const f = database();
  const upstream = mockSource(t);
  assert.equal((await refresh(f, { country: "Brazil" }, false)).status, 401);
  assert.equal(f.calls.length, 0);
  assert.equal(upstream.length, 0);
});

for (const role of ["editor", "team_admin"]) {
  test(role + " refresh validates before one atomic save and retains historical snapshot", async t => {
    const f = database(role);
    const upstream = mockSource(t);
    const response = await refresh(f);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.mean_temperature_c, 20);
    assert.equal(result.mean_relative_humidity_pct, 70);
    assert.equal(result.observations, 8760);
    assert.equal(result.period, "2025");
    assert.equal(f.batches.length, 1);
    assert.equal(f.DB.saved.length, 10);
    assert.deepEqual(f.DB.saved.slice(0, 5), f.DB.previous);
    assert.ok(result.source_url.includes("archive-api.open-meteo.com"));
    assert.equal(upstream.length, 1);
    assert.match(result.retrieved_at, /^\d{4}-\d{2}-\d{2}T/);
  });
}

test("public climate view returns the latest saved snapshot with source and timestamp", async t => {
  const f = database();
  mockSource(t);
  await refresh(f);
  const { default: worker } = await workerPromise;
  const response = await worker.fetch(new Request("https://site.example/api/evidence/climate"), f.env);
  const candidate = (await response.json()).candidates[0];
  assert.equal(candidate.source_id, 2);
  assert.equal(candidate.mean_temperature_c, 20);
  assert.equal(candidate.reference_location, "Brasilia");
  assert.ok(candidate.source_url.startsWith("https://archive-api.open-meteo.com/"));
  assert.match(candidate.retrieved_at, /T/);
});

test("upstream failure leaves the last valid snapshot unchanged", async t => {
  const f = database();
  mockSource(t, {}, 503);
  assert.equal((await refresh(f)).status, 503);
  assert.equal(f.batches.length, 0);
  assert.deepEqual(f.DB.saved, f.DB.previous);
});

const invalidCases = [
  ["unit", data => { data.hourly_units.temperature_2m = "F"; }],
  ["incomplete year", data => { data.hourly.time.pop(); }],
  ["missing temperature", data => { data.hourly.temperature_2m[0] = null; }],
  ["empty temperature", data => { data.hourly.temperature_2m[0] = ""; }],
  ["humidity range", data => { data.hourly.relative_humidity_2m[0] = 101; }],
  ["temperature range", data => { data.hourly.temperature_2m[0] = -101; }],
  ["wrong timestamp", data => { data.hourly.time[0] = "2024-01-01T00:00"; }],
  ["duplicate timestamp", data => { data.hourly.time[1] = data.hourly.time[0]; }],
  ["wrong location", data => { data.latitude = 45; }]
];
for (const [label, change] of invalidCases) {
  test("invalid " + label + " is rejected without replacing valid evidence", async t => {
    const f = database();
    const data = payload();
    change(data);
    mockSource(t, data);
    assert.equal((await refresh(f)).status, 502);
    assert.equal(f.batches.length, 0);
    assert.deepEqual(f.DB.saved, f.DB.previous);
  });
}

test("genuine zero climate values remain valid", async t => {
  const f = database();
  const data = payload();
  data.hourly.temperature_2m.fill(0);
  data.hourly.relative_humidity_2m.fill(0);
  mockSource(t, data);
  const response = await refresh(f);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.mean_temperature_c, 0);
  assert.equal(result.mean_relative_humidity_pct, 0);
});

test("failed atomic batch reports unavailable and preserves the previous mock snapshot", async t => {
  const f = database();
  f.DB.failBatch = true;
  mockSource(t);
  assert.equal((await refresh(f)).status, 503);
  assert.deepEqual(f.DB.saved, f.DB.previous);
});

test("unknown references, arbitrary URLs and missing country rows cause no API call", async t => {
  const f = database();
  const upstream = mockSource(t);
  assert.equal((await refresh(f, { country: "Other" })).status, 400);
  assert.equal((await refresh(f, { country: "Brazil", url: "https://unapproved.example" })).status, 400);
  f.DB.missingCountry = true;
  assert.equal((await refresh(f)).status, 409);
  assert.equal(upstream.length, 0);
  assert.equal(f.batches.length, 0);
});

class Element {
  constructor() { this.children = []; this.listeners = {}; this.textContent = ""; this.value = ""; this.disabled = false; }
  get options() { return this.children; }
  appendChild(child) { this.children.push(child); if (!this.value && child.value) this.value = child.value; return child; }
  replaceChildren() { this.children = []; }
  addEventListener(event, handler) { this.listeners[event] = handler; }
}

test("frontend editor refresh redraws saved evidence and retains it after failure", async () => {
  const ids = ["account-status", "chatgpt-sign-in", "register-button", "adviser-form", "adviser-design",
    "adviser-question", "adviser-send", "adviser-answer", "adviser-usage", "climate-refresh-controls",
    "climate-country", "climate-refresh-button", "climate-refresh-status", "climate-refresh-data"];
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  const calls = [];
  let fail = false;
  let value = 19;
  const context = vm.createContext({
    URL,
    document: { getElementById: id => nodes[id], createElement: () => new Element() },
    fetch: async (route, options = {}) => {
      calls.push({ route, options });
      if (route === "/api/account") return Response.json({ authenticated: true, registered: true, can_use_adviser: true, role: "editor" });
      if (route === "/api/designs") return Response.json({ designs: [] });
      if (route === "/api/evidence/climate/refresh") {
        if (fail) return Response.json({ message: "Source unavailable." }, { status: 503 });
        value = 20;
        return Response.json({ saved: true });
      }
      return Response.json({ candidates: [{ country: "Brazil", reference_location: "Brasilia", period: "2025",
        mean_temperature_c: value, min_temperature_c: 10, max_temperature_c: 30, mean_relative_humidity_pct: 70,
        observations: 8760, source_id: 12, source_url: "https://archive-api.open-meteo.com/v1/archive",
        retrieved_at: "2026-10-01", limitation: "Synthetic snapshot." }] });
    }
  });
  await vm.runInContext(fs.readFileSync(path.join(root, "website/adviser.js"), "utf8"), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes["climate-refresh-controls"].hidden, false);
  nodes["climate-country"].value = "Brazil";
  await nodes["climate-refresh-button"].listeners.click();
  assert.ok(nodes["climate-refresh-data"].children[0].textContent.includes("temperature 20"));
  const saved = nodes["climate-refresh-data"].children.map(item => item.textContent);
  fail = true;
  await nodes["climate-refresh-button"].listeners.click();
  assert.deepEqual(nodes["climate-refresh-data"].children.map(item => item.textContent), saved);
  const posted = calls.find(item => item.route === "/api/evidence/climate/refresh");
  assert.deepEqual(JSON.parse(posted.options.body), { country: "Brazil" });
  assert.deepEqual(Object.keys(posted.options.headers), ["Content-Type"]);
});
