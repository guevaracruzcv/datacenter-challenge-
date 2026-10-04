
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/dev/user") {
  const user = await getRegisteredUser(env, "dev-user-001");

  return Response.json({
    development_only: true,
    authenticated: false,
    user
  });
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
      const result = await env.DB.prepare(`
        SELECT
          c.name AS country,

          MAX(
            CASE
              WHEN m.metric_name = 'business_electricity_price'
              THEN m.value
            END
          ) AS business_price_usd_per_kwh,

          MAX(
            CASE
              WHEN m.metric_name = 'total_energy_consumption'
              THEN m.value
            END
          ) AS total_energy_consumption_exajoules,

          MAX(
            CASE
              WHEN m.metric_name = 'electricity_generation_solar_share'
              THEN m.value
            END
          ) AS electricity_generation_solar_pct,

          MAX(
            CASE
              WHEN m.metric_name = 'electricity_generation_wind_share'
              THEN m.value
            END
          ) AS electricity_generation_wind_pct,

          MAX(
            CASE
              WHEN m.metric_name = 'electricity_generation_hydro_share'
              THEN m.value
            END
          ) AS electricity_generation_hydro_pct,

          MAX(
            CASE
              WHEN m.metric_name = 'electricity_net_imports'
              THEN m.value
            END
          ) AS electricity_net_imports_twh

        FROM countries c

        LEFT JOIN metrics m
          ON m.country_id = c.id

        GROUP BY c.id, c.name

        ORDER BY c.name
      `).all();

      return Response.json(
  {
    count: result.results.length,
    countries: result.results
  },
  {
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:8000"
    }
  }
);

    }

    return new Response("Not Found", {
      status: 404
    });
  }
};
