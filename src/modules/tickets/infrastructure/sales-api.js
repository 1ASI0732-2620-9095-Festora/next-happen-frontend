import http from '@/shared/infrastructure/http.js'

/** Métricas de ventas para el panel del organizador. */
export class SalesApi {
    /** Resumen de ventas de un evento. */
    async getForEvent(eventId) {
        const { data } = await http.get(`/api/events/${eventId}/sales`)
        return data
    }

    /** Resumen de ventas de varios eventos a la vez. */
    async getForEvents(eventIds) {
        const { data } = await http.post('/api/sales/summary', { eventIds })
        return data
    }
}
