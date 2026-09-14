<template>
  <div class="new-stand">
    <h3 class="h-title mb-3">
      {{ isEdit ? $t('stands.editTitle') : $t('stands.newTitle') }}
    </h3>

    <div class="grid">
      <div class="col-12 md:col-6">
        <label for="stand-name" class="block mb-1">{{ $t('stands.name') }}</label>
        <pv-input-text
          id="stand-name"
          v-model.trim="form.name"
          required
          class="form-name"
          :class="{ 'p-invalid': nameTouched && !isNameValid }"
          :aria-invalid="nameTouched && !isNameValid"
          aria-describedby="stand-name-err"
          :placeholder="$t('stands.name')"
          @blur="nameTouched = true"
        />
        <small v-if="nameTouched && !isNameValid" id="stand-name-err" class="p-error block mt-1" role="alert">
          {{ $t('stands.errors.nameRequired') }}
        </small>
      </div>

      <div class="col-12 md:col-6">
        <label for="stand-cat" class="block mb-1">{{ $t('stands.category') }}</label>

        <!-- DROPDOWN EDITABLE -->
        <pv-dropdown
          id="stand-cat"
          v-model="form.category"
          :options="categories"
          editable
          class="w-full"
          :class="{ 'p-invalid': categoryTouched && !form.category }"
          :aria-invalid="categoryTouched && !form.category"
          aria-describedby="stand-cat-err"
          :placeholder="$t('stands.category')"
          @blur="categoryTouched = true"
        />
        <small v-if="categoryTouched && !form.category" id="stand-cat-err" class="p-error block mt-1" role="alert">
          {{ $t('stands.errors.categoryRequired') }}
        </small>
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <pv-button
        class="save-button"
        :label="isEdit ? $t('common.update') : $t('common.save')"
        icon="pi pi-check"
        :disabled="isFormInvalid"
        @click="onSubmit"
      />

      <router-link :to="{ name: 'org-register-stands' }">
        <pv-button :label="$t('common.cancel')" class="cancel-button" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssignStandsStore } from '@/modules/stands/application/assign-stands.store.js'

const store = useAssignStandsStore()
const route = useRoute()
const router = useRouter()

const eventId = route.params.eventId;  
const isEdit = !!route.params.id;

const nameTouched = ref(false)
const categoryTouched = ref(false)

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

const isNameValid = computed(() => form.name && form.name.trim().length >= 2)
const isFormInvalid = computed(() => !isNameValid.value || !form.category)

onMounted(() => {
  if (isEdit) {
    const found = store.stands.find(s => s.id == route.params.id || s.id === Number(route.params.id));
    if (found) Object.assign(form, found);
  }
});

async function onSubmit() {
  nameTouched.value = true
  categoryTouched.value = true

  if (isFormInvalid.value) return

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