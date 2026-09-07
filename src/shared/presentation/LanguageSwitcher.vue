<template>
  <div class="lang-switch">
    <Button
        icon="pi pi-globe"
        class="lang-btn p-button-text"
        @click="toggleLang"
        :aria-label="`Cambiar idioma a ${isEs ? 'Inglés' : 'Español'}`"
    />
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isEs = computed(() => locale.value === 'es')

function toggleLang() {
  const lang = isEs.value ? 'en' : 'es'
  locale.value = lang
  localStorage.setItem('nh-locale', lang)
}
</script>

<style scoped>

:deep(.lang-btn.p-button) {
  width: 45px;
  height: 45px;
  border: 2px solid #333;
  background-color: #f8f8f8;
  padding: 3px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20)
}

:deep(.lang-btn.p-button:hover) {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

:deep(.lang-btn .p-button-icon) {
  color: #333;
  font-size: 1.5rem;
  font-weight: 300;
}

:deep(.lang-btn.p-button:hover .p-button-icon) {
  color: #f59e0b;
}
</style>
