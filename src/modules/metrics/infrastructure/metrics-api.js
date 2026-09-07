import http from "@/shared/infrastructure/http.js";

export class MetricsApi {
  constructor() {
    this.basePath = "/api";
  }

  async registerAction(eventId, action) {
    try {
      await http.post(`${this.basePath}/metrics`, {
        eventId,          // ← GUID tal cual, sin convertir
        action,
        timestamp: new Date().toISOString()
      });
      console.log(`${action.toUpperCase()} registrada para evento ${eventId}`);
    } catch (e) {
      console.error("Error en MetricsApi.registerAction:", e);
    }
  }

  async getAll() {
    try {
      const res = await http.get(`${this.basePath}/metrics`);
      return res.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
