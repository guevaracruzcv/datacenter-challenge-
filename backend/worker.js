import { askAdviser, HttpError, readJsonBody } from "./adviser.mjs";
import { getClimate, refreshClimate } from "./climate.mjs";

async function getRegisteredUser(env, authenticatedUserId) {
  if (!authenticatedUserId) {
    return null;
  }

  return env.DB
    .prepare(`
      SELECT
        id,
        authenticated_user_id,
        email,
        team_id,
        role,
        registered_at
      FROM users
      WHERE authenticated_user_id = ?
    `)
    .bind(authenticatedUserId)
    .first();
}

function canUseAiAdviser(user) {
  if (!user) {
    return false;
  }

  return ["registered", "editor", "team_admin"].includes(user.role);
}

function getSitesIdentity(request) {
  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");

  if (!userId) {
    return null;
  }

  return {
    authenticated_user_id: userId,
    email: email || null
  };
}

// Use only behind Sites dispatch, which supplies the authenticated identity.
// The real AI Adviser handler must call this before reading evidence or calling AI.
export async function requireAiAdviserUser(request, env) {
  const deny = (status, error, message) => ({
    user: null,
    response: Response.json({ error, message }, { status })
  });

  const identity = getSitesIdentity(request);
  if (!identity) {
    return deny(401, "AuthenticationRequired", "Sign in with ChatGPT before using the AI Adviser.");
  }

  let user;
  try {
    user = await getRegisteredUser(env, identity.authenticated_user_id);
  } catch {
    return deny(503, "AuthorizationUnavailable", "Application authorization is temporarily unavailable.");
  }

  if (!user) {
    return deny(403, "RegistrationRequired", "Register with this application before using the AI Adviser.");
  }
  if (!canUseAiAdviser(user)) {
    return deny(403, "Forbidden", "User is not authorized to use the AI Adviser.");
  }

  return { user, response: null };
}

function privateJson(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

async function handleApplicationRoute(request, env, pathname) {
  const method = ["/api/account/register", "/api/ai/adviser", "/api/evidence/climate/refresh"].includes(pathname) ? "POST" : "GET";
  if (request.method !== method) {
    return privateJson({ error: "MethodNotAllowed", message: "Use " + method + "." }, 405);
  }
  if (method === "POST" && request.headers.has("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin) {
    return privateJson({ error: "Forbidden", message: "Use the site's own application page." }, 403);
  }
  try {
    if (pathname === "/api/evidence/climate") {
      return privateJson(await getClimate(env));
    }
    if (pathname === "/api/evidence/climate/refresh") {
      const access = await requireAiAdviserUser(request, env);
      if (access.response) return privateJson(await access.response.json(), access.response.status);
      if (!["editor", "team_admin"].includes(access.user.role)) {
        return privateJson({ error: "Forbidden", message: "Only an editor or team administrator can refresh evidence." }, 403);
      }
      return privateJson(await refreshClimate(env, await readJsonBody(request)));
    }
    if (pathname === "/api/designs") {
      const result = await env.DB.prepare(`
        SELECT d.id, d.name, c.name AS country, d.it_load_mw, d.pue, d.status
        FROM designs d LEFT JOIN countries c ON c.id = d.country_id
        ORDER BY d.id LIMIT 30
      `).all();
      return privateJson({ designs: result.results });
    }
    if (pathname === "/api/ai/adviser") {
      const access = await requireAiAdviserUser(request, env);
      if (access.response) {
        return privateJson(await access.response.json(), access.response.status);
      }
      return privateJson(await askAdviser(request, env, access.user));
    }
    const identity = getSitesIdentity(request);
    if (pathname === "/api/account/register") {
      if (!identity) {
        return privateJson({ error: "AuthenticationRequired", message: "Sign in with ChatGPT before registering." }, 401);
      }
      const body = await readJsonBody(request);
      if (Object.keys(body).length !== 0) {
        return privateJson({ error: "InvalidRegistration", message: "Registration uses your Sites identity; do not submit identity or role fields." }, 400);
      }
      await env.DB.prepare(`
        INSERT INTO users (authenticated_user_id, email, role)
        VALUES (?, ?, 'registered')
        ON CONFLICT(authenticated_user_id) DO NOTHING
      `).bind(identity.authenticated_user_id, identity.email).run();
    }
    const user = identity ? await getRegisteredUser(env, identity.authenticated_user_id) : null;
    return privateJson({
      authenticated: Boolean(identity), registered: Boolean(user),
      can_use_adviser: canUseAiAdviser(user), role: user?.role || null,
      email: identity?.email || null
    });
  } catch (error) {
    return privateJson({
      error: error instanceof HttpError ? error.code : "ApplicationUnavailable",
      message: error instanceof HttpError ? error.message : "The application database is temporarily unavailable."
    }, error instanceof HttpError ? error.status : 503);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (["/api/account", "/api/account/register", "/api/designs", "/api/ai/adviser",
      "/api/evidence/climate", "/api/evidence/climate/refresh"].includes(url.pathname)) {
      return handleApplicationRoute(request, env, url.pathname);
    }

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        service: "datacenter-challenge"
      });
    }

    if (url.pathname === "/api/evidence/summary") {
      const countries = await env.DB
        .prepare("SELECT COUNT(*) AS count FROM countries")
        .first();

      const metrics = await env.DB
        .prepare("SELECT COUNT(*) AS count FROM metrics")
        .first();

      return Response.json({
        countries: countries.count,
        metrics: metrics.count
      });
    }

    if (url.pathname === "/api/evidence/energy") {
      const result = await env.DB.prepare(`
        SELECT
          c.name AS country,
          m.metric_name,
          m.value,
          m.unit,
          m.period,
          m.evidence_type,
          m.notes AS metric_notes,
          s.name AS source_name,
          s.publisher,
          s.source_url,
          s.retrieved_at
        FROM metrics m
        JOIN countries c
          ON c.id = m.country_id
        LEFT JOIN sources s
          ON s.id = m.source_id
        ORDER BY c.name
      `).all();

      return Response.json({
        count: result.results.length,
        evidence: result.results
      });
    }


    if (url.pathname === "/api/screening/energy") {
      const fields = {
        business_electricity_price: "business_price_usd_per_kwh",
        total_energy_consumption: "total_energy_consumption_exajoules",
        electricity_generation_solar_share: "electricity_generation_solar_pct",
        electricity_generation_wind_share: "electricity_generation_wind_pct",
        electricity_generation_hydro_share: "electricity_generation_hydro_pct",
        electricity_net_imports: "electricity_net_imports_twh"
      };
      const result = await env.DB.prepare(`
        SELECT c.name AS country, m.metric_name, m.value, m.unit, m.period
        FROM countries c
        LEFT JOIN metrics m
          ON m.country_id = c.id
         AND m.metric_name IN (${Object.keys(fields).map(() => "?").join(", ")})
        ORDER BY c.name
      `).bind(...Object.keys(fields)).all();

      const headers = { "Access-Control-Allow-Origin": "http://localhost:8000" };
      const countries = new Map();
      for (const row of result.results) {
        if (!countries.has(row.country)) {
          countries.set(row.country, {
            data: { country: row.country, ...Object.fromEntries(Object.values(fields).map(field => [field, null])) },
            observations: new Map()
          });
        }
        const country = countries.get(row.country);
        const field = fields[row.metric_name];
        // Missing observations cannot contradict a known value or become zero.
        if (!field || row.value == null || row.value === "") continue;
        const previous = country.observations.get(row.metric_name);
        if (previous && (previous.value !== row.value || previous.unit !== row.unit || previous.period !== row.period)) {
          return Response.json({
            error: "EvidenceConflict",
            message: "Conflicting screening evidence requires review.",
            country: row.country,
            metric: row.metric_name
          }, { status: 409, headers });
        }
        country.observations.set(row.metric_name, row);
        country.data[field] = row.value;
      }

      return Response.json({
        count: countries.size,
        countries: [...countries.values()].map(country => country.data)
      }, { headers });
    }

    return new Response("Not Found", {
      status: 404
    });
  }
};
