<template>
  <div class="twofa-wrapper">
    <!-- 🌐 Botón idioma -->
    <div class="lang-toggle">
      <button @click="toggleLanguage" class="btn-lang">
        🌐 {{ currentLang === 'es' ? 'EN' : 'ES' }}
      </button>
    </div>

    <div class="twofa-card">
      <div class="shield-icon" aria-hidden="true">
        <i class="pi pi-shield"></i>
      </div>

      <h2 class="title">{{ t('twoFactor.title') }}</h2>
      <p class="subtitle">
        {{ t('twoFactor.subtitle') }}
      </p>

      <div class="email-badge">
        <i class="pi pi-envelope"></i>
        <span>{{ userEmail || 'user@nexthappen.pe' }}</span>
      </div>

      <!-- Demo helper banner for evaluation/testing -->
      <div v-if="demoCode" class="demo-code-banner" role="status">
        <small class="demo-label">{{ t('twoFactor.demoCodeLabel') }}:</small>
        <strong class="demo-code">{{ demoCode }}</strong>
      </div>

      <form @submit.prevent="handleVerify" class="twofa-form" novalidate>
        <div class="form-group">
          <label for="otp-code">{{ t('twoFactor.enterCode') }}</label>
          <input
            id="otp-code"
            ref="otpInput"
            v-model="code"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="······"
            class="otp-input"
            :class="{ 'input-invalid': error }"
            :aria-invalid="!!error"
            aria-describedby="otp-error"
            autofocus
            required
            @input="handleInput"
          />
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="loading || code.length !== 6"
        >
          {{ loading ? t('twoFactor.verifying') : t('twoFactor.verifyButton') }}
        </button>

        <p v-if="error" id="otp-error" class="error-text" role="alert">{{ error }}</p>
      </form>

      <div class="resend-section">
        <p v-if="countdown > 0" class="countdown-text">
          {{ t('twoFactor.resendIn') }} <strong>{{ countdown }}s</strong>
        </p>
        <button
          v-else
          type="button"
          class="btn-resend"
          :disabled="resending"
          @click="handleResend"
        >
          <i class="pi pi-refresh"></i>
          {{ resending ? t('twoFactor.resending') : t('twoFactor.resendButton') }}
        </button>
      </div>

      <div class="back-section">
        <button type="button" class="btn-cancel" @click="cancelAuth">
          {{ t('twoFactor.backToLogin') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifyTwoFactorCode, sendTwoFactorCode } from '@/modules/iam/infrastructure/auth.api.js'

const router = useRouter()
const { t, locale } = useI18n()

const code = ref('')
const loading = ref(false)
const resending = ref(false)
const error = ref('')
const countdown = ref(60)
const demoCode = ref('')
const userEmail = ref('')
const otpInput = ref(null)
const currentLang = ref(locale.value)

let timer = null

function startCountdown() {
  countdown.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

function toggleLanguage() {
  const nextLang = locale.value === 'es' ? 'en' : 'es'
  locale.value = nextLang
  currentLang.value = nextLang
  localStorage.setItem('nh-locale', nextLang)
  localStorage.setItem('lang', nextLang)
}

function handleInput(e) {
  // Allow numbers only
  code.value = e.target.value.replace(/\D/g, '').slice(0, 6)
  error.value = ''
}

async function handleVerify() {
  if (code.value.length !== 6) return
  error.value = ''
  loading.value = true

  try {
    await verifyTwoFactorCode(userEmail.value, code.value)

    // Retrieve pending authentication payload
    const pendingRaw = sessionStorage.getItem('nh_pending_auth')
    if (pendingRaw) {
      const pending = JSON.parse(pendingRaw)
      localStorage.setItem('token', pending.token)
      localStorage.setItem('userId', pending.userId)
      localStorage.setItem('role', pending.role)
      localStorage.setItem('userName', pending.userName)
      localStorage.setItem('userEmail', pending.userEmail)
      localStorage.setItem('user', JSON.stringify({
        id: pending.userId,
        name: pending.userName,
        email: pending.userEmail,
        role: pending.role
      }))

      sessionStorage.removeItem('nh_pending_auth')
      sessionStorage.removeItem('nh_pending_email')
      sessionStorage.removeItem('nh_2fa_expected_code')

      if (pending.role === 'User') {
        router.push('/user/home')
      } else {
        router.push('/org/dashboard')
      }
    } else {
      router.push('/signin')
    }
  } catch (err) {
    error.value = t('twoFactor.invalidCode')
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  resending.value = true
  error.value = ''
  try {
    const res = await sendTwoFactorCode(userEmail.value)
    const receivedCode = res.data?.debugCode || res.data?.code
    if (receivedCode) {
      demoCode.value = receivedCode
    }
    startCountdown()
  } catch (err) {
    error.value = t('twoFactor.resendError')
  } finally {
    resending.value = false
  }
}

function cancelAuth() {
  sessionStorage.removeItem('nh_pending_auth')
  sessionStorage.removeItem('nh_pending_email')
  sessionStorage.removeItem('nh_2fa_expected_code')
  router.push('/signin')
}

onMounted(async () => {
  const pendingRaw = sessionStorage.getItem('nh_pending_auth')
  const emailStored = sessionStorage.getItem('nh_pending_email')

  if (!pendingRaw && !emailStored) {
    // If accessed directly without authentication challenge, redirect
    router.replace('/signin')
    return
  }

  userEmail.value = emailStored || (pendingRaw ? JSON.parse(pendingRaw).userEmail : '')

  // Generate / request code
  const res = await sendTwoFactorCode(userEmail.value)
  const receivedCode = res.data?.debugCode || res.data?.code
  if (receivedCode) {
    demoCode.value = receivedCode
  }
  startCountdown()

  // Focus input
  otpInput.value?.focus()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.twofa-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  background-color: #fffdf8;
  font-family: 'Inter', sans-serif;
  padding: 1.5rem;
}

.lang-toggle {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
}

.btn-lang {
  border: 2px solid #000;
  background: #fff;
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
  transition: all 0.2s ease;
}

.btn-lang:hover {
  background: #000;
  color: #fff;
}

.twofa-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  padding: 2.5rem 2rem;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 1);
  text-align: center;
}

.shield-icon {
  width: 60px;
  height: 60px;
  background-color: #ffcd00;
  border: 2px solid #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 1.25rem;
  box-shadow: 3px 3px 0 #000;
}

.title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 0.4rem;
  color: #1a202c;
}

.subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.email-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1.25rem;
}

.demo-code-banner {
  background-color: #eff6ff;
  border: 1px dashed #3b82f6;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.demo-label {
  font-size: 0.8rem;
  color: #1e40af;
}

.demo-code {
  font-family: monospace;
  font-size: 1.1rem;
  letter-spacing: 2px;
  color: #1d4ed8;
}

.twofa-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.otp-input {
  width: 80%;
  margin: 0 auto;
  padding: 0.75rem;
  font-size: 1.8rem;
  font-family: monospace;
  letter-spacing: 12px;
  text-align: center;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  outline: none;
  background-color: #fff;
  transition: all 0.2s ease;
}

.otp-input:focus {
  border-color: #f59e0b;
  box-shadow: 4px 4px 0 #f59e0b;
}

.input-invalid {
  border-color: #d32f2f !important;
  box-shadow: 3px 3px 0 #d32f2f !important;
}

.btn-submit {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  border: 2px solid #000;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: #000;
  color: #fff;
  box-shadow: 2px 2px 0 #000;
  transition: all 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #ffcd00;
  color: #000;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #d32f2f;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0.25rem 0 0;
}

.resend-section {
  margin-top: 1.25rem;
  font-size: 0.88rem;
}

.countdown-text {
  color: #64748b;
  margin: 0;
}

.btn-resend {
  background: none;
  border: none;
  color: #000;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-resend:hover {
  color: #f59e0b;
}

.back-section {
  margin-top: 1rem;
}

.btn-cancel {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
}

.btn-cancel:hover {
  color: #000;
}
</style>
