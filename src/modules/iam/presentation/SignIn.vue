<template>
    <div class="sign-in">

        <div class="signup-wrapper">
          <!-- 🌐 Botón idioma -->
          <div class="lang-toggle">
            <button @click="toggleLanguage" class="btn-lang">
              🌐 {{ currentLang === 'es' ? 'EN' : 'ES' }}
            </button>
          </div>
      
          <div class="signup-card">
            <h2 class="title">{{ t('signin.title') }}</h2>
            <p class="subtitle">{{ t('signin.subtitle') }}</p>
      
            <!-- 🔹 Selección de tipo de cuenta -->
            <div class="user-type-section">
              <p class="user-type-title">{{ t('signin.selectType') }}</p>
              <div class="user-type-buttons">
                <button
                  type="button"
                  class="user-type-btn"
                  :class="{ active: userType === 'user' }"
                  @click="userType = 'user'"
                >
                  {{ t('signin.user') }}
                </button>
                <button
                  type="button"
                  class="user-type-btn"
                  :class="{ active: userType === 'organizer' }"
                  @click="userType = 'organizer'"
                >
                  {{ t('signin.organizer') }}
                </button>
              </div>
            </div>
      
            <form @submit.prevent="loginUser" class="signup-form">
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
                <label for="password">{{ t('signin.password') }}</label>
                <input
                  id="password"
                  v-model.trim="password"
                  type="password"
                  :placeholder="t('signin.passwordPlaceholder')"
                  minlength="6"
                  required
                />
              </div>
      
              <button type="submit" class="btn-submit" :disabled="loading">
                {{ loading ? t('signin.loading') : t('signin.button') }}
              </button>
      
              <p v-if="error" class="error-text">{{ error }}</p>
            </form>
      
            <p class="login-text">
              {{ t('signin.noAccount') }}
              <router-link to="/signup" class="login-link">{{ t('signin.create') }}</router-link>
            </p>
          </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { loginUserService } from "@/modules/iam/infrastructure/auth.api.js"
import { jwtDecode } from "jwt-decode"

const router = useRouter()
const { t, locale } = useI18n()

const email = ref("")
const password = ref("")
const userType = ref("") 
const loading = ref(false)
const error = ref("")
const currentLang = ref(locale.value)

function toggleLanguage() {
  locale.value = locale.value === "es" ? "en" : "es"
  currentLang.value = locale.value
  localStorage.setItem("lang", locale.value)
}

async function loginUser() {
  error.value = ""

  if (!userType.value) {
    error.value = currentLang.value === "es"
      ? "Por favor selecciona tu tipo de cuenta."
      : "Please select your account type."
    return
  }

  loading.value = true

  try {
    const payload = {
      Email: email.value,
      Password: password.value,
      Role: userType.value === "user" ? "User" : "Organizer"
    }


    const res = await loginUserService(payload)
    const token = res.data?.token || res.data?.accessToken || res.data?.Token;
    console.log("Token recibido en SignIn:", token);

    if (!token) {
        throw new Error("El backend no devolvió un token. Respuesta: " + JSON.stringify(res.data));
    }

    // Decodificar token correctamente
    let decoded;
    try {
        decoded = jwtDecode(token);
    } catch (e) {
        throw new Error("Error decodificando JWT en SignIn. Token crudo: " + token);
    }

    // Guardar valores REALES del usuario logueado
    const userRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const userId = decoded.id || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const userName = decoded.name || decoded.unique_name || decoded.FullName || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Organizer";
    const userEmail = decoded.email || decoded.Email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";

    localStorage.setItem("token", token)
    localStorage.setItem("userId", userId)
    localStorage.setItem("role", userRole)
    localStorage.setItem("userName", userName)
    localStorage.setItem("userEmail", userEmail)

    // Legacy support
    localStorage.setItem("user", JSON.stringify({
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole
    }))

    console.log("UserId guardado:", userId)


    // Redirección según el tipo de usuario
    if (userRole === "User") {
      router.push("/user/home")
    } else {
      router.push("/org/dashboard")
    }

  } catch (err) {
    console.error("Error login:", err)
    error.value = "Credenciales incorrectas"
  } finally {
    loading.value = false
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

/* 🔹 Tipo de cuenta */
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
