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

    return new Response("Not Found", {
      status: 404
    });
  }
};
