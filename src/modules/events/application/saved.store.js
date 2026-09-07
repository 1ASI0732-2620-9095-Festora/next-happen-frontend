import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSavedStore = defineStore('saved', () => {
  const getUserId = () => localStorage.getItem('userId') || 'guest'
  const getStorageKey = () => `nh_saved_${getUserId()}`

  const savedEvents = ref(JSON.parse(localStorage.getItem(getStorageKey()) || '[]'))

  function persist() {
    localStorage.setItem(getStorageKey(), JSON.stringify(savedEvents.value))
  }

  // Saber si ya está guardado
  function isSaved(id) {
    return savedEvents.value.some(e => e.id === id || e.eventId === id)
  }

  // Guardar evento
  function addSaved(event) {
    if (!isSaved(event.id)) {
      savedEvents.value.push(event)
      persist()
    }
  }

  // Quitar guardado
  function removeSaved(id) {
    savedEvents.value = savedEvents.value.filter(e => e.id !== id && e.eventId !== id)
    persist()
  }

  // Cargar datos (útil al cambiar de usuario)
  function loadSaved() {
    savedEvents.value = JSON.parse(localStorage.getItem(getStorageKey()) || '[]')
  }

  return {
    savedEvents,
    isSaved,
    addSaved,
    removeSaved,
    loadSaved
  }
})
