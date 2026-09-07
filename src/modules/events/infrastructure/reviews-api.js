import http from '@/shared/infrastructure/http.js'

/** Capa HTTP para reseñas y calificaciones de eventos. */
export class ReviewsApi {
    /** Resumen público: { average, count, distribution, items }. */
    async getForEvent(eventId) {
        const { data } = await http.get(`/api/events/${eventId}/reviews`)
        return data
    }

    /** Crea o actualiza la reseña del usuario autenticado. */
    async submit(eventId, rating, comment) {
        const { data } = await http.post(`/api/events/${eventId}/reviews`, { rating, comment })
        return data
    }
}
