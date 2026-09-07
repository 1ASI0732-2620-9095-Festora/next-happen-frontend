<template>
  <div class="stands-page">
    <h2 class="h-title mb-2">Registro de Stands</h2>
    <p class="mb-4 p-muted">Selecciona un evento para asignar y gestionar stands.</p>

    <!-- ========================== -->
    <!-- DROPDOWN DE EVENTOS REALES -->
    <!-- ========================== -->
    <div class="grid mb-3">
      <div class="col-12 md:col-6">
        <label class="block mb-2 p-muted">Seleccionar Evento</label>

        <pv-dropdown
          v-model="selectedEvent"
          :options="events"
          optionLabel="title"
          optionValue="id"
          placeholder="Selecciona un evento"
          class="fair-select"
          @change="onSelectEvent"
        />
      </div>
    </div>

    <!-- ============================================ -->
    <!-- TABLA: SOLO SE MUESTRAN STANDS DEL EVENTO -->
    <!-- ============================================ -->
    <div class="table-container" v-if="selectedEvent">
      <pv-data-table
        :value="stands"
        :loading="loading"
        responsiveLayout="scroll"
        class="custom-table"
      >
        <pv-column field="name" header="Nombre" />
        <pv-column field="category" header="Categoría" />
        <pv-column header="Acciones" style="width:12rem">
          <template #body="{ data }">
            <pv-button
              class="edit-button"
              label="Editar"
              icon="pi pi-pencil"
              @click="goEdit(data.id)"
            />

            <span class="mx-2"> </span>

            <pv-button
              class="delete-button"
              label="Eliminar"
              icon="pi pi-trash"
              @click.prevent="onDelete(data)"
            />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <!-- BOTÓN PARA CREAR NUEVO STAND -->
    <router-link
      v-if="selectedEvent"
      :to="{
  name: 'org-stand-new',
  params: { eventId: selectedEvent }
}"

    >
      <pv-button class="add-button" label="Agregar Emprendedor" icon="pi pi-plus" />
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAssignStandsStore } from "@/modules/stands/application/assign-stands.store.js"

const route = useRoute()
const router = useRouter()
const store = useAssignStandsStore()

const selectedEvent = ref(null)

const events = computed(() => store.events)
const stands = computed(() => store.stands)
const loading = computed(() => store.loading)

// 🔥 Llamado al seleccionar evento
function onSelectEvent() {
  if (selectedEvent.value) {
    store.fetchAssigned(selectedEvent.value)
    router.replace({ query: { eventId: selectedEvent.value } })
  }
}

// 🔥 Cargar eventos y stands si ya hay uno seleccionado
onMounted(async () => {
  await store.fetchEvents()

  if (route.query.eventId) {
    selectedEvent.value = route.query.eventId
    await store.fetchAssigned(selectedEvent.value)
  }
})

// 🔥 Reaccionar a cambios manuales del dropdown
watch(selectedEvent, async (value) => {
  if (value) await store.fetchAssigned(value)
})

// 🔥 Navegar a EDIT correctamente
function goEdit(id) {
  router.push({
    name: "org-stand-edit",
    params: {
      eventId: selectedEvent.value,
      id
    }
  })
}

// 🔥 Eliminar stand
async function onDelete(stand) {
  await store.remove(stand.id)
}
</script>

<style scoped>
.stands-page {
  max-width: 80rem;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.custom-table {
  border: 2px solid #333;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.add-button {
  margin-top: 2rem;
  border: 2px solid #333;
  height: 38px;
  background-color: #ffcd00;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-weight: bold;
}

.add-button:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.edit-button {
  border: 2px solid #333;
  background-color: #ffcd00;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-weight: bold;
}

.edit-button:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.delete-button {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  background-color: #d32f2f;
  font-size: 0.95rem;
  font-weight: bold;
}

.delete-button:hover {
  border: 2px solid #d32f2f;
  box-shadow: none;
  color: #d32f2f;
  background-color: #fff7ed;
  cursor: pointer;
}
</style>
