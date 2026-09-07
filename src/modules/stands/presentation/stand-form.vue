<template>
  <div class="new-stand">
    <h3 class="h-title mb-3">
      {{ isEdit ? $t('stands.editTitle') : $t('stands.newTitle') }}
    </h3>

    <div class="grid">
      <div class="col-12 md:col-6">
        <label class="block mb-1">{{ $t('stands.name') }}</label>
        <pv-input-text
          v-model.trim="form.name"
          required
          class="form-name"
          :placeholder="$t('stands.name')"
        />
      </div>

      <div class="col-12 md:col-6">
        <label class="block mb-1">{{ $t('stands.category') }}</label>

        <!-- DROPDOWN EDITABLE -->
        <pv-dropdown
          v-model="form.category"
          :options="categories"
          editable
          class="w-full"
          :placeholder="$t('stands.category')"
        />
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <pv-button
        class="save-button"
        :label="isEdit ? $t('common.update') : $t('common.save')"
        icon="pi pi-check"
        @click="onSubmit"
      />

      <router-link :to="{ name: 'org-register-stands' }">
        <pv-button :label="$t('common.cancel')" class="cancel-button" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssignStandsStore } from '@/modules/stands/application/assign-stands.store.js'

const store = useAssignStandsStore()
const route = useRoute()
const router = useRouter()

const eventId = route.params.eventId;  
const isEdit = !!route.params.id;

onMounted(() => {
  if (isEdit) {
    const found = store.stands.find(s => s.id == route.params.id);
    if (found) Object.assign(form, found);
  }
});

const categories = ref([
  'Comida', 'Arte', 'Ropa', 'Bebidas', 'Accesorios',
  'Servicios', 'Manualidades', 'Tecnología',
  'Salud & Bienestar', 'Juegos'
])

const form = reactive({
  id: null,
  name: '',
  category: ''
})

onMounted(() => {
  if (isEdit) {
    const found = store.stands.find(s => s.id === Number(route.params.id))
    if (found) Object.assign(form, found)
  }
})

async function onSubmit() {
  if (isEdit) {
    await store.update(form)
  } else {
    await store.add(eventId, form)
  }

  router.push({
    name: "org-stands-list",
    query: { eventId }
  })
}

</script>

<style scoped>
.new-stand {
  max-width: 80rem;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.form-name {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  height: 38px;
  width: 100%;
  font-family: 'Inter', sans-serif; 
}

.save-button {
  border: 2px solid #333;
  height: 38px;
  background-color: #ffcd00;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-weight: bold;
}

.save-button:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.cancel-button {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  background-color: #d32f2f;
  height: 38px;
  font-size: 0.95rem;
  font-weight: bold;
}

.cancel-button:hover {
  border: 2px solid #d32f2f;
  box-shadow: none;
  color: #d32f2f;
  background-color: #fff7ed;
  cursor: pointer;
}
</style>