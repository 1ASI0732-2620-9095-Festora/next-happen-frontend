<template>
  <div class="lang-switch">
    <button
      type="button"
      class="lang-pill"
      @click="toggleLang"
      :aria-label="`Cambiar idioma a ${isEs ? 'Inglés' : 'Español'}`"
      :title="`Cambiar idioma (actual: ${isEs ? 'Español' : 'English'})`"
    >
      <i class="pi pi-globe"></i>
      <span class="lang-text">{{ isEs ? 'ES' : 'EN' }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isEs = computed(() => locale.value === 'es')

function toggleLang() {
  const lang = isEs.value ? 'en' : 'es'
  locale.value = lang
  localStorage.setItem('nh-locale', lang)
  localStorage.setItem('lang', lang)
}
</script>

<style scoped>
.lang-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #333;
  background-color: #ffcd00;
  color: #111;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 2px 2px 0 #333;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;
  user-select: none;
}

.lang-pill:hover {
  background-color: #ffe066;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #333;
}

.lang-pill:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #333;
}

.lang-pill i {
  font-size: 1rem;
}

.lang-text {
  letter-spacing: 0.05em;
}
</style>

