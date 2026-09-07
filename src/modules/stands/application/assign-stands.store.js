import { defineStore } from "pinia"
import { ref } from "vue"
import http from "@/shared/infrastructure/http.js"

export const useAssignStandsStore = defineStore("assignStands", () => {
  const events = ref([])
  const stands = ref([])
  const loading = ref(false)

  // ---------------------------
  // Cargar eventos
  // ---------------------------
  async function fetchEvents() {
    loading.value = true
    try {
      const res = await http.get(`/api/events`)
      const organizerId = localStorage.getItem('userId')
      events.value = res.data.filter(
        ev => ev.organizer === organizerId
      )
    } catch (e) {
      events.value = []
    } finally { loading.value = false }
  }

  // ---------------------------
  // Cargar stands del evento
  // ---------------------------
  async function fetchAssigned(eventId) {
    loading.value = true
    try {
      const res = await http.get(`/api/events/${eventId}/stands`)
      stands.value = res.data
    } catch (e) {
      stands.value = []
    } finally { loading.value = false }
  }

  // ---------------------------
  // Crear stand
  // ---------------------------
 async function add(eventId, payload) {
  const body = {
    name: payload.name,
    category: payload.category
  };

  const res = await http.post(`/api/events/${eventId}/stands`, body);
  stands.value.push(res.data);
}


  // ---------------------------
  // Editar stand
  // ---------------------------
  async function update(payload) {
    const res = await http.put(`/api/stands/${payload.id}`, payload)

    const i = stands.value.findIndex(s => s.id === payload.id)
    if (i !== -1) stands.value[i] = res.data
  }

  // ---------------------------
  // Eliminar stand
  // ---------------------------
  async function remove(id) {
    await http.delete(`/api/stands/${id}`)
    stands.value = stands.value.filter(s => s.id !== id)
  }

  return {
    events,
    stands,
    loading,
    fetchEvents,
    fetchAssigned,
    add,
    update,
    remove
  }
})
