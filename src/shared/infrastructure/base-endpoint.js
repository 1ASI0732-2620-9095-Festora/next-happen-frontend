// src/shared/infrastructure/base-endpoint.js

/**
 * BaseEndpoint: CRUD genérico sobre un path usando un BaseApi.
 * Usado por tus APIs de contexto (p. ej., StandsApi).
 */
export class BaseEndpoint {
    /**
     * @param {import('@/shared/infrastructure/base-api.js').BaseApi} baseApi
     * @param {string} endpointPath p.ej. "/api/stands"
     */
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    getAll() {
        return this.http.get(this.endpointPath);
    }

    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}

export default BaseEndpoint;
