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

      <form @submit.prevent="registerUser" class="signup-form">
        <div class="form-group">
          <label for="name">{{ t('signup.name') }}</label>
          <input
            id="name"
            v-model.trim="name"
            type="text"
            :placeholder="t('signup.namePlaceholder')"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">{{ t('signup.email') }}</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            :placeholder="t('signup.emailPlaceholder')"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">{{ t('signup.password') }}</label>
          <input
            id="password"
            v-model.trim="password"
            type="password"
            :placeholder="t('signup.passwordPlaceholder')"
            minlength="6"
            required
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? t('signup.creating') : t('signup.create') }}
        </button>

        <p v-if="error" class="error-text">{{ error }}</p>
      </form>

      <p class="login-text">
        {{ t('signup.already') }}
        <router-link to="/signin" class="login-link">{{ t('signup.signin') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { registerUserService, loginUserService } from "@/modules/iam/infrastructure/auth.api.js";
import { jwtDecode } from "jwt-decode";

const router = useRouter()
const { t, locale } = useI18n()

const name = ref("")
const email = ref("")
const password = ref("")
const userType = ref("") // Nuevo: tipo de cuenta
const loading = ref(false)
const error = ref("")
const currentLang = ref(locale.value)

function toggleLanguage() {
  locale.value = locale.value === "es" ? "en" : "es"
  currentLang.value = locale.value
  localStorage.setItem("lang", locale.value)
}


async function registerUser() {
  error.value = "";

  if (!userType.value) {
    error.value =
      currentLang.value === "es"
        ? "Por favor selecciona tu tipo de cuenta."
        : "Please select your account type.";
    return;
  }

  loading.value = true;

  try {
    const payload = {
      FullName: name.value,       
      Email: email.value,         
      Password: password.value,   
      Role: userType.value === "user" ? "User" : "Organizer" 
    };

    // 1. Crear usuario
    await registerUserService(payload);

    // 2. Auto-login para obtener el Token
    const loginRes = await loginUserService({
      Email: email.value,
      Password: password.value
    });

    // Guardar token y rol real
    const token = loginRes.data?.token || loginRes.data?.accessToken || loginRes.data?.Token;
    console.log("Token recibido del backend:", token);
    
    if (!token) {
        throw new Error("El backend no devolvió un token válido. Respuesta: " + JSON.stringify(loginRes.data));
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
    localStorage.setItem("userType", payload.Role); // Para legacy code si existe
    localStorage.setItem("role", payload.Role); // Formato correcto usado en el router

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
</style>
