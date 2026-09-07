import { BaseApi } from "@/shared/infrastructure/base-api.js";

export class AssignStandsApi extends BaseApi {

    constructor() {
        super(import.meta.env.VITE_API_URL);
    }

    getAllAssigned(eventId) {
        return this.get(`/api/events/${eventId}/stands`);
    }

    assignStand(eventId, resource) {
        return this.post(`/api/events/${eventId}/stands`, resource);
    }

    updateAssigned(id, resource) {
        return this.put(`/api/stands/${id}`, resource);
    }

    deleteAssigned(id) {
        return this.delete(`/api/stands/${id}`);
    }
}
