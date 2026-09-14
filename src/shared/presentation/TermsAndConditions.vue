<template>
  <div class="terms-page">
    <div class="terms-container">
      <header class="terms-header">
        <button type="button" class="back-link" @click="handleBack">
          <i class="pi pi-arrow-left"></i> {{ t('legal.backToHome') }}
        </button>
        <h1 class="terms-title">{{ t('legal.pageTitle') }}</h1>
        <p class="terms-subtitle">{{ t('legal.lastUpdated') }}: 2026-09-08</p>
      </header>

      <div class="terms-body">
        <section class="terms-section">
          <h2>1. {{ t('legal.section1Title') }}</h2>
          <p>{{ t('legal.section1Full') }}</p>
        </section>

        <section class="terms-section">
          <h2>2. {{ t('legal.section2Title') }}</h2>
          <p>{{ t('legal.section2Full') }}</p>
        </section>

        <section class="terms-section">
          <h2>3. {{ t('legal.section3Title') }}</h2>
          <p>{{ t('legal.section3Full') }}</p>
        </section>

        <section class="terms-section">
          <h2>4. {{ t('legal.section4Title') }}</h2>
          <p>{{ t('legal.section4Full') }}</p>
        </section>

        <section class="terms-section">
          <h2>5. {{ t('legal.section5Title') }}</h2>
          <p>{{ t('legal.section5Full') }}</p>
        </section>

        <section class="terms-section">
          <h2>6. {{ t('legal.section6Title') }}</h2>
          <p>{{ t('legal.section6Full') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!token) {
      router.push('/signin')
    } else if (role === 'Organizer') {
      router.push('/org/dashboard')
    } else {
      router.push('/user/home')
    }
  }
}
</script>

<style scoped>
.terms-page {
  min-height: 85vh;
  padding: 3rem 1.5rem;
  background-color: #fffdf8;
  font-family: 'Inter', sans-serif;
}

.terms-container {
  max-width: 860px;
  margin: 0 auto;
  background: #ffffff;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 2.5rem;
}

.terms-header {
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #000;
  font-weight: 600;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0;
  margin-bottom: 1rem;
  transition: transform 0.2s ease;
}

.back-link:hover {
  transform: translateX(-3px);
  color: #f59e0b;
}

.terms-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: #1a202c;
}

.terms-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.terms-section {
  margin-bottom: 2rem;
}

.terms-section h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.terms-section p {
  color: #334155;
  line-height: 1.7;
  font-size: 0.98rem;
  margin: 0;
}
</style>
