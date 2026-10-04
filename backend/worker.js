export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

    return new Response("Not Found", {
      status: 404
    });
  }
};
