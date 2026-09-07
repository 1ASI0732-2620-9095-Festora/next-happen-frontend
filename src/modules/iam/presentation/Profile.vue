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
  email.value = JSON.parse(localStorage.getItem("user"))?.email || ""
  avatar.value = localStorage.getItem("userAvatar") || ""
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
</style>
