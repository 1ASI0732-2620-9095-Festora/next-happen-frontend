import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserNotificationsStore = defineStore('userNotifications', () => {
  const notifications = ref([])
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

  const getStorageKey = () => {
    const userId = localStorage.getItem('userId') || 'guest'
    return `nh_user_notifs_${userId}`
  }

  function persist() {
    localStorage.setItem(getStorageKey(), JSON.stringify(notifications.value))
  }

  function load() {
    try {
      const stored = localStorage.getItem(getStorageKey())
      notifications.value = stored ? JSON.parse(stored) : []
    } catch {
      notifications.value = []
    }
  }

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function addNotification(notif) {
    // Evitar duplicados por id
    if (!notifications.value.some(n => n.id === notif.id)) {
      notifications.value.unshift({
        ...notif,
        timestamp: notif.timestamp || new Date().toISOString(),
        read: false
      })
      persist()
    }
  }

  function markAsRead(id) {
    const target = notifications.value.find(n => n.id === id)
    if (target) {
      target.read = true
      persist()
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => { n.read = true })
    persist()
  }

  // Genera recordatorios inteligentes cruzando tickets y eventos
  async function syncSmartAlerts() {
    load()
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    try {
      // 1. Cargar eventos públicos
      const eventsRes = await axios.get(`${API_URL}/api/events/public`)
      const events = eventsRes.data || []
      const eventMap = new Map(events.map(e => [e.id, e]))

      // 2. Alertas por categorías suscritas
      const interestsKey = `nh_interests_${userId || 'guest'}`
      const savedInterests = JSON.parse(localStorage.getItem(interestsKey) || '[]')
      if (savedInterests.length) {
        savedInterests.forEach(cat => {
          const matching = events.filter(e => e.category === cat)
          if (matching.length) {
            addNotification({
              id: `cat_alert_${cat}_${matching[0].id}`,
              type: 'category',
              title: `Alerta de Categoría: ${cat}`,
              body: `Hay ${matching.length} evento(s) disponibles en tu categoría favorita '${cat}'.`,
              link: `/user/search?cat=${encodeURIComponent(cat)}`,
              icon: 'pi pi-tag',
              category: cat
            })
          }
        })
      }

      // 3. Recordatorios por tickets comprados (US30 Recordatorios)
      if (userId && token) {
        const ticketsRes = await axios.get(`${API_URL}/api/users/${userId}/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const tickets = ticketsRes.data || []
        const activeTickets = tickets.filter(t => t.status === 'Active')

        activeTickets.forEach(tk => {
          const ev = eventMap.get(tk.eventId)
          if (ev) {
            const startDate = new Date(ev.startDate || ev.dateRange?.startDate)
            const dateStr = !isNaN(startDate.getTime())
              ? startDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
              : 'próximamente'

            addNotification({
              id: `reminder_ticket_${tk.id}`,
              type: 'reminder',
              title: `Recordatorio de Evento: ${ev.title}`,
              body: `¡Tu entrada para '${ev.title}' está lista! El evento inicia el ${dateStr}.`,
              link: `/user/publishment/${ev.id}`,
              icon: 'pi pi-calendar',
              eventId: ev.id
            })
          }
        })
      }
    } catch (e) {
      console.warn('Error sincronizando alertas inteligentes:', e)
    }
  }

  return {
    notifications,
    unreadCount,
    load,
    addNotification,
    markAsRead,
    markAllAsRead,
    syncSmartAlerts
  }
})
