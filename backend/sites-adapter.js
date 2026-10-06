import backend from "./worker.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return backend.fetch(request, env, ctx);
    }

    return new Response("Sites adapter: route not implemented yet", {
      status: 404
    });
  }
};
