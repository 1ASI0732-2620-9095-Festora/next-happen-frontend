<template>
  <header class="organizer-header">
    <RouterLink class="organizer-logo" to="/org/dashboard">
      <div class="logo">
        <img src="@/shared/assets/Group.png" alt="NextHappen Logo" class="logo-img" />
      </div>
    </RouterLink>

    <div class="actions">
      <LanguageSwitcher />

      <RouterLink to="/org/entrepreneur">
        <pv-button icon="pi pi-chart-line" class="options p-button-text" />
      </RouterLink>

      <RouterLink to="/org/register-stands">
        <pv-button icon="pi pi-shop" class="options p-button-text" />
      </RouterLink>

      <RouterLink to="/org/create-event">
        <pv-button icon="pi pi-plus" class="options p-button-text" />
      </RouterLink>

      <RouterLink to="/org/events">
        <pv-button icon="pi pi-calendar" class="options p-button-text" />
      </RouterLink>

      <RouterLink to="/org/sales" title="Ventas">
        <pv-button icon="pi pi-dollar" class="options p-button-text" />
      </RouterLink>

      <RouterLink to="/org/validate" title="Validar entradas">
        <pv-button icon="pi pi-qrcode" class="options p-button-text" />
      </RouterLink>

      <RouterLink to="/org/notifications">
        <pv-button icon="pi pi-bell" class="options p-button-text" />
      </RouterLink>

      <!-- 🔹 Nombre y avatar del organizador -->
      <div v-if="userName" class="user-info">
        <p class="profile">{{ userName }}</p>
        <Avatar
          class="profile-img"
          :image="userAvatar"
          shape="circle"
          @click="goToProfile"
        />
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="handleFileChange"
        />
      </div>

      <!-- 🔹 Si no hay usuario -->
      <RouterLink v-else to="/signup">
        <button class="signup-btn">{{ $t('header.signup') }}</button>
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { RouterLink } from "vue-router"
import Avatar from "primevue/avatar"
import LanguageSwitcher from "@/shared/presentation/LanguageSwitcher.vue"

// datos reactivos
const userName = ref("")
const userAvatar = ref("")
const fileInput = ref(null)

import { useRouter } from 'vue-router'
const router = useRouter()

function goToProfile() {
  router.push('/org/profile')
}

// al montar el componente, carga datos guardados del organizador
onMounted(() => {
  userName.value = localStorage.getItem("userName") || ""
  userAvatar.value = localStorage.getItem("userAvatar") || ""
})

// abre el selector de archivos
function uploadImage() {
  fileInput.value?.click()
}

// guarda la imagen en localStorage
function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    userAvatar.value = reader.result
    localStorage.setItem("userAvatar", reader.result)
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.logo-img {
  display: block;
  height: auto;
  width: auto;
  max-height: 45px;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.organizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fffdf8;
  border-bottom: 2px solid #333;
  padding: 5px 40px;
  font-family: "Inter", sans-serif;
}

/* --- Nombre del organizador --- */
.profile {
  min-width: 90px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  font-weight: 500;
  font-size: 1rem;
  color: #333;
  border: 2px solid #333;
  background-color: #f8f8f8;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.profile-img {
  width: 40px !important;
  height: 40px !important;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  object-fit: cover;
  cursor: pointer;
}

.profile-img:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.hidden-input {
  display: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

/* --- Botones del menú --- */
:deep(.options.p-button) {
  width: 45px;
  height: 45px;
  border: 2px solid #333;
  background-color: #f8f8f8;
  padding: 3px;
  align-items: center;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

:deep(.options.p-button:hover) {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

:deep(.options.p-button:hover .p-button-icon) {
  color: #f59e0b !important;
}

:deep(.options .p-button-icon) {
  margin: 0 !important;
  font-size: 1.5rem;
  font-weight: 300;
  color: #333;
}

/* --- Logo --- */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 22px;
  color: #222;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* --- Botón de registro (por si no hay usuario) --- */
.signup-btn {
  background-color: #ffcd00;
  border: 2px solid #333;
  padding: 8px 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.signup-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background-color: #ffffff;
  box-shadow: none;
}
</style>
