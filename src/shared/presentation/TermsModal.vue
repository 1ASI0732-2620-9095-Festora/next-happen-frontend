<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :header="t('legal.modalTitle')"
    :style="{ width: '90vw', maxWidth: '750px' }"
    :breakpoints="{ '960px': '85vw', '640px': '95vw' }"
    :closable="true"
    class="terms-dialog"
  >
    <div class="terms-content" tabindex="0" role="region" :aria-label="t('legal.modalTitle')">
      <h3>1. {{ t('legal.section1Title') }}</h3>
      <p>{{ t('legal.section1Text') }}</p>

      <h3>2. {{ t('legal.section2Title') }}</h3>
      <p>{{ t('legal.section2Text') }}</p>

      <h3>3. {{ t('legal.section3Title') }}</h3>
      <p>{{ t('legal.section3Text') }}</p>

      <h3>4. {{ t('legal.section4Title') }}</h3>
      <p>{{ t('legal.section4Text') }}</p>

      <h3>5. {{ t('legal.section5Title') }}</h3>
      <p>{{ t('legal.section5Text') }}</p>

      <h3>6. {{ t('legal.section6Title') }}</h3>
      <p>{{ t('legal.section6Text') }}</p>
    </div>

    <template #footer>
      <div class="modal-footer-actions">
        <pv-button
          :label="t('legal.close')"
          icon="pi pi-times"
          class="p-button-text p-button-secondary"
          @click="visible = false"
        />
        <pv-button
          :label="t('legal.acceptAndClose')"
          icon="pi pi-check"
          class="btn-accept"
          @click="onAccept"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'accepted'])

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function onAccept() {
  emit('accepted')
  visible.value = false
}
</script>

<style scoped>
.terms-content {
  max-height: 55vh;
  overflow-y: auto;
  padding: 1rem;
  line-height: 1.6;
  font-size: 0.95rem;
  color: #2c3e50;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: #fafaf9;
}

.terms-content h3 {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a202c;
}

.terms-content p {
  margin-bottom: 0.75rem;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.btn-accept {
  background-color: #ffcd00 !important;
  color: #000 !important;
  border: 2px solid #000 !important;
  font-weight: 700 !important;
  box-shadow: 2px 2px 0 #000 !important;
}

.btn-accept:hover {
  background-color: #f59e0b !important;
  box-shadow: none !important;
}
</style>
