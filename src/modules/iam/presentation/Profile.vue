<template>
  <div class="profile-page">
    <h2 class="title">{{ t('profile.title') }}</h2>
    <p class="subtitle">{{ t('profile.subtitle') }}</p>

    <div class="profile-card">
      <div class="avatar-section" @click="triggerFileInput">
        <!-- Si hay foto subida la muestra, si no, ícono pi-user -->
        <div class="avatar-box">
          <template v-if="avatar">
            <img :src="avatar" class="avatar-img" alt="User Avatar" />
          </template>
          <template v-else>
            <i class="pi pi-user default-icon"></i>
          </template>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="handleFileChange"
        />

        <p class="avatar-hint">{{ t('profile.changePhoto') }}</p>
      </div>

      <div class="form-section">
        <label>{{ t('profile.name') }}</label>
        <div class="input-section">

            <input
              type="text"
              v-model="name"
              placeholder="Tu nombre"
              class="input-field"
            />
        </div>

        <label>{{ t('profile.email') }}</label>

        <div class="input-section">
            <input
  type="email"
  v-model="email"
  :placeholder="email || 'tu@correo.com'"
  class="input-field"
/>

        </div>

        <!-- Security & 2FA -->
        <div class="security-card">
          <div class="sec-header">
            <i class="pi pi-shield sec-icon" aria-hidden="true"></i>
            <div>
              <h4 class="sec-title">{{ t('profile.securityTitle') }}</h4>
              <p class="sec-desc">{{ t('profile.securityDesc') }}</p>
            </div>
          </div>
          <div class="sec-toggle-row">
            <span class="sec-label">{{ t('profile.twoFactorAuth') }}</span>
            <input
              type="checkbox"
              id="twofa-toggle"
              v-model="twoFactorEnabled"
              class="sec-checkbox"
              @change="toggle2FA"
            />
          </div>
          <small class="sec-status" :class="twoFactorEnabled ? 'status-active' : 'status-inactive'">
            {{ twoFactorEnabled ? t('profile.twoFactorActive') : t('profile.twoFactorInactive') }}
          </small>
        </div>

        <div class="btn-group">
          <button class="btn-save" @click="saveProfile">{{ t('profile.save') }}</button>
          <button class="btn-logout" @click="logout">{{ t('profile.logout') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const router = useRouter()

const name = ref("")
const email = ref("")
const avatar = ref("")
const fileInput = ref(null)
const twoFactorEnabled = ref(true)

function toggle2FA() {
  const userObj = JSON.parse(localStorage.getItem("user") || "{}")
  const currentEmail = userObj?.email || localStorage.getItem("userEmail") || email.value
  localStorage.setItem(`nh_2fa_${currentEmail}`, twoFactorEnabled.value ? 'true' : 'false')
}

/* =====================================================
   CLOUDINARY CONFIG (igual que create-event)
===================================================== */
const CLOUDINARY_UPLOAD_PRESET = "nexthappen_unsigned"
const CLOUDINARY_CLOUD_NAME = "dmdswrhah"

/* =====================================================
   SUBIR IMAGEN A CLOUDINARY
===================================================== */
const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  })

  const data = await res.json()
  return data.secure_url
}

/* =====================================================
   Cargar datos guardados
===================================================== */
onMounted(() => {
  name.value = localStorage.getItem("userName") || ""
  email.value = JSON.parse(localStorage.getItem("user"))?.email || localStorage.getItem("userEmail") || ""
  avatar.value = localStorage.getItem("userAvatar") || ""

  const currentEmail = email.value || localStorage.getItem("userEmail") || ""
  twoFactorEnabled.value = localStorage.getItem(`nh_2fa_${currentEmail}`) !== 'false'
})

/* =====================================================
   Cambiar imagen → subir a Cloudinary
===================================================== */
function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  uploadToCloudinary(file).then(url => {
    avatar.value = url
    localStorage.setItem("userAvatar", url)
  })
}

function triggerFileInput() {
  fileInput.value?.click()
}

/* =====================================================
   Guardar datos del usuario localmente
===================================================== */
function saveProfile() {
  if (!name.value || !email.value) return alert(t("profile.fillFields"))

  localStorage.setItem("userName", name.value)
  localStorage.setItem("userAvatar", avatar.value)

  const user = JSON.parse(localStorage.getItem("user")) || {}
  localStorage.setItem("user", JSON.stringify({
    ...user,
    name: name.value,
    email: email.value,
    avatar: avatar.value
  }))

  alert(t("profile.saved"))
}

/* =====================================================
   Logout
===================================================== */
function logout() {
  localStorage.removeItem("user")
  localStorage.removeItem("userName")
  localStorage.removeItem("userAvatar")
  localStorage.removeItem("userType")
  router.push("/signin")
}
</script>


<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "Inter", sans-serif;
  background-color: #fffdf8;
  padding: 2rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  text-align: center;
}

.subtitle {
  color: #555;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  text-align: center;
}

.profile-card {
  background: #fff;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.input-section {
  display: flex;
}

/* --- Avatar / Icono --- */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}

.avatar-box {
  width: 120px;
  height: 120px;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f9f9f9;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  font-size: 4rem;
  color: #555;
}

.avatar-hint {
  font-size: 0.85rem;
  color: #555;
  text-align: center;
}

/* --- Formulario --- */
.form-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  padding: 0.8rem;
  border: 2px solid #000;
  font-size: 1rem;
  outline: none;
  width: 100%;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}


.btn-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-save,
.btn-logout {
  flex: 1;
  padding: 0.8rem 0;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

/* Guardar */
.btn-save {
  background: #000;
  color: #fff;
}
.btn-save:hover {
  background: #fff;
  color: #000;
  box-shadow: none;
  cursor: pointer;
}

/* Cerrar sesión */
.btn-logout {
  background: #fff;
  color: #000;
}
.btn-logout:hover {
  background: #000;
  color: #fff;
  cursor: pointer;
  box-shadow: none;
}

.hidden-input {
  display: none;
}

.security-card {
  margin: 1.5rem 0 1rem;
  padding: 1.25rem;
  background: #fafaf9;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  text-align: left;
}

.sec-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sec-icon {
  font-size: 1.5rem;
  color: #f59e0b;
}

.sec-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.sec-desc {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.sec-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-top: 1px solid #e2e8f0;
}

.sec-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
}

.sec-checkbox {
  width: 20px !important;
  height: 20px !important;
  cursor: pointer;
  accent-color: #000;
}

.sec-status {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.status-active {
  color: #16a34a;
}

.status-inactive {
  color: #dc2626;
}
</style>
