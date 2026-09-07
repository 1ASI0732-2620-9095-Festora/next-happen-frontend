import http from '@/shared/infrastructure/http.js'

/**
 * Capa HTTP para pagos y entradas. Usa el cliente `http` compartido, que ya
 * adjunta el token JWT y gestiona los 401 de forma centralizada.
 */
export class PaymentsApi {
    /**
     * Inicia el checkout de Stripe. Devuelve { orderId, checkoutUrl }.
     * El componente debe redirigir a checkoutUrl.
     */
    async createCheckout(eventId, quantity) {
        const { data } = await http.post('/api/payments/checkout', { eventId, quantity })
        return data
    }

    /**
     * Confirma el pago al volver de Stripe (respaldo del webhook). Emite las entradas
     * si el cobro se completó. Devuelve { status, quantity, paid }.
     */
    async confirmCheckout(sessionId) {
        const { data } = await http.get('/api/payments/confirm', { params: { session_id: sessionId } })
        return data
    }

    /** Entradas del usuario (requiere sesión). */
    async getUserTickets(userId) {
        const { data } = await http.get(`/api/users/${userId}/tickets`)
        return data
    }

    /** Reembolsa una entrada vía Stripe y libera el cupo. */
    async refund(ticketId) {
        const { data } = await http.post(`/api/tickets/${ticketId}/refund`)
        return data
    }

    /** Valida una entrada por su código QR o código corto (rol organizador/admin). */
    async validate(qrCode) {
        const { data } = await http.post('/api/tickets/validate', { qrCode })
        return data
    }

    /** Lista de asistentes (entradas) de un evento, para validar con un clic. */
    async getEventTickets(eventId) {
        const { data } = await http.get(`/api/events/${eventId}/tickets`)
        return data
    }

    /**
     * Descarga el PNG del QR (endpoint protegido) y devuelve un object URL
     * utilizable en un <img>. Recuerda revocarlo cuando ya no se use.
     */
    async getQrObjectUrl(ticketId) {
        const res = await http.get(`/api/tickets/${ticketId}/qr`, { responseType: 'blob' })
        return URL.createObjectURL(res.data)
    }
}
