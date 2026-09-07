<template>
  <header class="main-header">
    <RouterLink to="/user/home">
      <div class="logo">
        <img src="@/shared/assets/Group.png" alt="NextHappen Logo" class="logo-img" />
      </div>
    </RouterLink>

    <nav class="actions">
      <LanguageSwitcher />

      <RouterLink to="/user/home">
        <pv-button icon="pi pi-home" class="options" />
      </RouterLink>

      <RouterLink to="/user/events">
        <pv-button icon="pi pi-heart" class="options" />
      </RouterLink>

      <RouterLink to="/user/tickets">
        <pv-button icon="pi pi-ticket" class="options" />
      </RouterLink>

      <!-- 🔹 Si hay usuario logueado, muestra nombre y avatar -->
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

      <!-- 🔹 Si no hay usuario logueado, muestra botón de registro -->
      <RouterLink v-else to="/signup">
        <button class="signup-btn">{{ $t('header.signup') }}</button>
      </RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { RouterLink } from "vue-router"
import LanguageSwitcher from "@/shared/presentation/LanguageSwitcher.vue"
import Avatar from "primevue/avatar"

const userName = ref("")
const userAvatar = ref("")
const fileInput = ref(null)

import { useRouter } from 'vue-router'
const router = useRouter()

function goToProfile() {
  router.push('/user/profile')
}

// Cargar datos del usuario si existen en localStorage
onMounted(() => {
  userName.value = localStorage.getItem("userName") || ""
  userAvatar.value = localStorage.getItem("userAvatar") || ""
})

// Abrir selector de archivo al hacer clic en el avatar
function uploadImage() {
  fileInput.value?.click()
}

// Guardar imagen de perfil en localStorage
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
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fffdf8;
  border-bottom: 2px solid #333;
  padding: 5px 40px;
  font-family: 'Inter', sans-serif;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  display: block;
  height: auto;
  width: auto;
  max-height: 45px;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
}

.center-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
  justify-content: center;
}

.search-container {
  display: flex;
  align-items: center;
  border: 2px solid #333;
  padding: 5px 10px;
  width: 20%;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 100%;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
}

:deep(.search-container:hover) {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow: 3px 3px 0 rgba(245, 158, 11, 1);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

:deep(.options.p-button) {
  width: 45px;
  height: 45px;
  border: 2px solid #333;
  background-color: #f8f8f8;
  padding: 3px;
  align-items: center;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20)
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

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
  cursor: pointer;
  object-fit: cover;
}

.profile-img:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

/* Input oculto para subir imagen */
.hidden-input {
  display: none;
}

:deep(.options.p-button:hover) {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

:deep(.options .pi) {
  font-size: 1.5rem;
  color: #333;
}

.signup-btn {
  background-color: #ffcd00;
  border: 2px solid #333;
  padding: 8px 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
}

.signup-btn:hover {
  border: 2px solid #f59e0b;
  color: #f59e0b;
  background-color: #ffffff;
  box-shadow: none;
}

:deep(.options.p-button:hover .p-button-icon) {
  color: #f59e0b !important;
}

:deep(.actions a) {
  text-decoration: none !important;
  color: inherit !important;
  display: flex;
  align-items: center;
}
</style>