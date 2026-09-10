<template>
  <div class="signup-wrapper">
    <!-- 🌐 Botón de idioma -->
    <div class="lang-toggle">
      <button @click="toggleLanguage" class="btn-lang">
        🌐 {{ currentLang === 'es' ? 'EN' : 'ES' }}
      </button>
    </div>

    <div class="signup-card">
      <h2 class="title">{{ t('signup.title') }}</h2>
      <p class="subtitle">{{ t('signup.subtitle') }}</p>

      <!-- 🔹 Selección de tipo de cuenta -->
      <div class="user-type-section">
        <p class="user-type-title">{{ t('signup.userTypeTitle') }}</p>
        <div class="user-type-buttons">
          <button
            type="button"
            class="user-type-btn"
            :class="{ active: userType === 'user' }"
            @click="userType = 'user'"
          >
            {{ t('signup.user') }}
          </button>
          <button
            type="button"
            class="user-type-btn"
            :class="{ active: userType === 'organizer' }"
            @click="userType = 'organizer'"
          >
            {{ t('signup.organizer') }}
          </button>
        </div>
      </div>

      <form @submit.prevent="registerUser" class="signup-form" novalidate>
        <!-- Name -->
        <div class="form-group">
          <label for="name">{{ t('signup.name') }}</label>
          <input
            id="name"
            v-model.trim="name"
            type="text"
            :placeholder="t('signup.namePlaceholder')"
            :class="{ 'input-invalid': nameTouched && nameError }"
            :aria-invalid="!!(nameTouched && nameError)"
            aria-describedby="name-error"
            @blur="nameTouched = true"
            required
          />
          <small v-if="nameTouched && nameError" id="name-error" class="field-error" role="alert">
            {{ nameError }}
          </small>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">{{ t('signup.email') }}</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            :placeholder="t('signup.emailPlaceholder')"
            :class="{ 'input-invalid': emailTouched && emailError }"
            :aria-invalid="!!(emailTouched && emailError)"
            aria-describedby="email-error"
            @blur="emailTouched = true"
            required
          />
          <small v-if="emailTouched && emailError" id="email-error" class="field-error" role="alert">
            {{ emailError }}
          </small>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">{{ t('signup.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            :placeholder="t('signup.passwordPlaceholder')"
            :class="{ 'input-invalid': passwordTouched && passwordError }"
            :aria-invalid="!!(passwordTouched && passwordError)"
            aria-describedby="password-error"
            @blur="passwordTouched = true"
            required
          />
          <!-- Password strength bar -->
          <div v-if="password" class="password-meter" aria-hidden="true">
            <div
              class="meter-bar"
              :class="passwordStrengthClass"
              :style="{ width: `${(passwordScore / 4) * 100}%` }"
            ></div>
          </div>
          <small v-if="passwordTouched && passwordError" id="password-error" class="field-error" role="alert">
            {{ passwordError }}
          </small>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword">{{ t('signup.confirmPassword', 'Confirm Password') }}</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            :placeholder="t('signup.confirmPasswordPlaceholder', 'Repeat your password')"
            :class="{ 'input-invalid': confirmPasswordTouched && confirmPasswordError }"
            :aria-invalid="!!(confirmPasswordTouched && confirmPasswordError)"
            aria-describedby="confirm-error"
            @blur="confirmPasswordTouched = true"
            required
          />
          <small v-if="confirmPasswordTouched && confirmPasswordError" id="confirm-error" class="field-error" role="alert">
            {{ confirmPasswordError }}
          </small>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading || isFormInvalid">
          {{ loading ? t('signup.creating') : t('signup.create') }}
        </button>

        <p v-if="error" class="error-text" role="alert">{{ error }}</p>
      </form>

      <p class="login-text">
        {{ t('signup.already') }}
        <router-link to="/signin" class="login-link">{{ t('signup.signin') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { registerUserService, loginUserService } from "@/modules/iam/infrastructure/auth.api.js";
import { useValidators } from "@/shared/composables/useValidators.js";
import { jwtDecode } from "jwt-decode";

const router = useRouter()
const { t, locale } = useI18n()
const {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateFullName
} = useValidators()

const name = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const userType = ref("")
const loading = ref(false)
const error = ref("")
const currentLang = ref(locale.value)

// Touched state trackers for accessible UX
const nameTouched = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)
const confirmPasswordTouched = ref(false)

// Validation computations
const nameResult = computed(() => validateFullName(name.value))
const nameError = computed(() => nameResult.value.valid ? '' : t(nameResult.value.errorKey))

const emailResult = computed(() => validateEmail(email.value))
const emailError = computed(() => emailResult.value.valid ? '' : t(emailResult.value.errorKey))

const passwordResult = computed(() => validatePassword(password.value))
const passwordError = computed(() => passwordResult.value.valid ? '' : t(passwordResult.value.errorKey))
const passwordScore = computed(() => passwordResult.value.score || 0)

const passwordStrengthClass = computed(() => {
  if (passwordScore.value <= 1) return 'meter-weak'
  if (passwordScore.value <= 3) return 'meter-medium'
  return 'meter-strong'
})

const confirmPasswordResult = computed(() => validatePasswordMatch(password.value, confirmPassword.value))
const confirmPasswordError = computed(() => confirmPasswordResult.value.valid ? '' : t(confirmPasswordResult.value.errorKey))

const isFormInvalid = computed(() => {
  return (
    !userType.value ||
    !nameResult.value.valid ||
    !emailResult.value.valid ||
    !passwordResult.value.valid ||
    !confirmPasswordResult.value.valid
  )
})

function toggleLanguage() {
  const nextLang = locale.value === "es" ? "en" : "es"
  locale.value = nextLang
  currentLang.value = nextLang
  localStorage.setItem("nh-locale", nextLang)
  localStorage.setItem("lang", nextLang)
}

async function registerUser() {
  error.value = "";
  nameTouched.value = true;
  emailTouched.value = true;
  passwordTouched.value = true;
  confirmPasswordTouched.value = true;

  if (!userType.value) {
    error.value =
      currentLang.value === "es"
        ? "Por favor selecciona tu tipo de cuenta."
        : "Please select your account type.";
    return;
  }

  if (isFormInvalid.value) {
    error.value = currentLang.value === "es"
      ? "Por favor corrige los campos con error antes de continuar."
      : "Please correct the fields with errors before continuing.";
    return;
  }

  loading.value = true;

  try {
    const payload = {
      FullName: name.value.trim(),       
      Email: email.value.trim(),         
      Password: password.value,   
      Role: userType.value === "user" ? "User" : "Organizer" 
    };

    // 1. Crear usuario
    await registerUserService(payload);

    // 2. Auto-login para obtener el Token
    const loginRes = await loginUserService({
      Email: email.value.trim(),
      Password: password.value
    });

    const token = loginRes.data?.token || loginRes.data?.accessToken || loginRes.data?.Token;
    console.log("Token recibido del backend:", token);
    
    if (!token) {
        throw new Error("El backend no devolvió un token válido.");
    }

    let decoded;
    try {
        decoded = jwtDecode(token);
    } catch (e) {
        throw new Error("Error decodificando el JWT. Token crudo: " + token);
    }

    const userId = decoded.id || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", name.value);
    localStorage.setItem("userType", payload.Role);
    localStorage.setItem("role", payload.Role);

    loading.value = false;

    // 3. Redirigir según el rol
    if (payload.Role === "User") router.push("/user/home");
    else router.push("/org/dashboard");

  } catch (err) {
    console.error(err);
    error.value = t("signup.error");
    loading.value = false;
  }
}
</script>

<style scoped>
.signup-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fffdf8;
  font-family: "Inter", sans-serif;
}

/* 🌐 Botón idioma */
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
  transform: translateY(-1px);
}

/* 💡 Tarjeta principal */
.signup-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 2rem;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  text-align: center;
}

.title {
  font-size: 1.8rem;
  margin-bottom: 0.2rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1.5rem;
}

/* 🔹 Sección tipo de usuario */
.user-type-section {
  margin-bottom: 1.5rem;
}

.user-type-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-type-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.user-type-btn {
  border: 2px solid #000;
  background: #fff;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.user-type-btn:hover {
  background: #000;
  color: #fff;
  box-shadow: none;
}

.user-type-btn.active {
  background: #000;
  color: #fff;
  box-shadow: none;
}

/* 🧾 Formulario */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.3rem;
}

.form-group input {
  width: 94%;
  padding: 0.7rem;
  border: 2px solid #000;
  font-size: 1rem;
  outline: none;
  transition: box-shadow 0.2s ease;
}

.form-group input:focus {
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.btn-submit {
  margin-top: 1rem;
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #000;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: #000;
  color: #fff;
}

.btn-submit:hover {
  background: #fff;
  color: #000;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: red;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.login-text {
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.login-link {
  color: #000;
  font-weight: 600;
  text-decoration: underline;
}

.input-invalid {
  border-color: #d32f2f !important;
  background-color: #fff8f8;
}

.field-error {
  color: #d32f2f;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.25rem;
  display: block;
}

.password-meter {
  width: 94%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  margin-top: 0.35rem;
  overflow: hidden;
}

.meter-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.meter-weak {
  background-color: #d32f2f;
}

.meter-medium {
  background-color: #f59e0b;
}

.meter-strong {
  background-color: #10b981;
}
</style>
