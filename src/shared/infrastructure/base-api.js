import http from './http.js';

export class BaseApi {
    #http;
    constructor() {
        this.#http = http;
    }

    // Backward-compatible getter used by BaseEndpoint.
    get http() { return this.#http; }

    // Convenience methods delegating to the shared instance.
    get(url, config) { return this.#http.get(url, config); }
    post(url, data, config) { return this.#http.post(url, data, config); }
    put(url, data, config) { return this.#http.put(url, data, config); }
    delete(url, config) { return this.#http.delete(url, config); }
}
