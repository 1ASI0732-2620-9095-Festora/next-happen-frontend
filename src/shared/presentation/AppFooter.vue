<template>
  <footer class="app-footer" role="contentinfo" aria-label="Footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-header">
          <img src="@/shared/assets/Group.png" alt="NextHappen Logo" class="footer-logo" />
          <span class="brand-tagline">{{ t('footer.tagline') }}</span>
        </div>
        <p class="brand-desc">{{ t('footer.desc') }}</p>
      </div>

      <div class="footer-links-group">
        <h4 class="links-title">{{ t('footer.legalTitle') }}</h4>
        <ul class="links-list">
          <li>
            <router-link to="/terms-and-conditions" class="footer-link">
              {{ t('footer.terms') }}
            </router-link>
          </li>
          <li>
            <a href="https://www.acm.org/code-of-ethics" target="_blank" rel="noopener noreferrer" class="footer-link">
              {{ t('footer.ethicsAcm') }} <i class="pi pi-external-link" style="font-size: 0.75rem;"></i>
            </a>
          </li>
          <li>
            <a href="https://www.cip.org.pe" target="_blank" rel="noopener noreferrer" class="footer-link">
              {{ t('footer.ethicsCip') }} <i class="pi pi-external-link" style="font-size: 0.75rem;"></i>
            </a>
          </li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h4 class="links-title">{{ t('footer.aboutTitle') }}</h4>
        <ul class="links-list">
          <li><span class="footer-info">Festora Startup © 2026</span></li>
          <li><span class="footer-info">{{ t('footer.location') }}</span></li>
          <li><span class="footer-info">Lima Metropolitana, Perú</span></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>{{ t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.app-footer {
  background-color: #1a1a1a;
  color: #f5f5f5;
  border-top: 3px solid #000;
  padding: 2.5rem 1.5rem 1.5rem;
  font-family: 'Inter', sans-serif;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #333;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.footer-brand .brand-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.footer-logo {
  height: 38px;
  width: auto;
  background: #fff;
  border-radius: 4px;
  padding: 2px;
}

.brand-tagline {
  font-weight: 700;
  font-size: 1.1rem;
  color: #ffcd00;
}

.brand-desc {
  font-size: 0.88rem;
  color: #a3a3a3;
  line-height: 1.5;
  max-width: 380px;
  margin: 0;
}

.links-title {
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffcd00;
  margin: 0 0 1rem 0;
}

.links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: #d4d4d4;
  text-decoration: none;
  font-size: 0.88rem;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.footer-link:hover {
  color: #ffcd00;
  text-decoration: underline;
}

.footer-info {
  font-size: 0.88rem;
  color: #a3a3a3;
}

.footer-bottom {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  text-align: center;
  font-size: 0.8rem;
  color: #737373;
}
</style>
