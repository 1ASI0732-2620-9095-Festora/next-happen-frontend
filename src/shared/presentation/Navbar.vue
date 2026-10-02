<template>
  <header class="main-header">
    <RouterLink to="/user/home" class="logo-link">
      <div class="logo">
        <img src="@/shared/assets/Group.png" alt="NextHappen Logo" class="logo-img" />
      </div>
    </RouterLink>

    <!-- Desktop Nav -->
    <nav class="actions desktop-actions">
      <LanguageSwitcher />

      <RouterLink to="/user/home" :title="$t('nav.home') || 'Inicio'">
        <pv-button icon="pi pi-home" class="options" />
      </RouterLink>

      <RouterLink to="/user/search" :title="$t('search.title') || 'Buscar'">
        <pv-button icon="pi pi-search" class="options" />
      </RouterLink>

      <RouterLink to="/user/events" :title="$t('saved.title') || 'Favoritos'">
        <pv-button icon="pi pi-heart" class="options" />
      </RouterLink>

      <RouterLink to="/user/tickets" :title="$t('tickets.pageTitle') || 'Mis Entradas'">
        <pv-button icon="pi pi-ticket" class="options" />
      </RouterLink>

      <RouterLink to="/user/notifications" class="notif-link" :title="$t('notifications.title') || 'Notificaciones'">
        <pv-button icon="pi pi-bell" class="options" />
        <span v-if="unreadCount > 0" class="notif-badge-counter">{{ unreadCount }}</span>
      </RouterLink>

      <!-- 🔹 Si hay usuario logueado, muestra nombre y avatar -->
      <div v-if="userName" class="user-info" @click="goToProfile">
        <p class="profile">{{ userName }}</p>
        <Avatar
          class="profile-img"
          :image="userAvatar"
          shape="circle"
        />
      </div>

      <!-- 🔹 Si no hay usuario logueado, muestra botón de registro -->
      <RouterLink v-else to="/signup">
        <button class="signup-btn">{{ $t('header.signup') }}</button>
      </RouterLink>
    </nav>

    <!-- Mobile Hamburger Toggle -->
    <div class="mobile-toggle-wrap">
      <LanguageSwitcher />
      <button
        type="button"
        class="mobile-menu-btn"
        @click="mobileMenuOpen = !mobileMenuOpen"
        :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
      >
        <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
      </button>
    </div>

    <!-- Mobile Drawer Overlay -->
    <transition name="drawer-fade">
      <div v-if="mobileMenuOpen" class="mobile-drawer-overlay" @click.self="mobileMenuOpen = false">
        <div class="mobile-drawer">
          <div class="drawer-header">
            <span class="drawer-title">Menú NextHappen</span>
            <button class="drawer-close" @click="mobileMenuOpen = false">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div v-if="userName" class="drawer-user" @click="goToProfile(); mobileMenuOpen = false">
            <Avatar class="profile-img" :image="userAvatar" shape="circle" />
            <div class="drawer-user-info">
              <strong>{{ userName }}</strong>
              <small>Ver Perfil</small>
            </div>
          </div>

          <ul class="mobile-nav-list">
            <li>
              <RouterLink to="/user/home" class="mobile-nav-item" @click="mobileMenuOpen = false">
                <i class="pi pi-home"></i> {{ $t('nav.home') || 'Inicio' }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/user/search" class="mobile-nav-item" @click="mobileMenuOpen = false">
                <i class="pi pi-search"></i> {{ $t('search.title') || 'Explorar Eventos' }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/user/events" class="mobile-nav-item" @click="mobileMenuOpen = false">
                <i class="pi pi-heart"></i> {{ $t('saved.title') || 'Favoritos' }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/user/tickets" class="mobile-nav-item" @click="mobileMenuOpen = false">
                <i class="pi pi-ticket"></i> {{ $t('tickets.pageTitle') || 'Mis Entradas' }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/user/notifications" class="mobile-nav-item" @click="mobileMenuOpen = false">
                <i class="pi pi-bell"></i> {{ $t('notifications.title') || 'Notificaciones' }}
                <span v-if="unreadCount > 0" class="mobile-notif-count">{{ unreadCount }}</span>
              </RouterLink>
            </li>
          </ul>

          <div class="drawer-footer">
            <RouterLink v-if="!userName" to="/signup" class="mobile-signup-btn" @click="mobileMenuOpen = false">
              {{ $t('header.signup') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { RouterLink, useRouter } from "vue-router"
import LanguageSwitcher from "@/shared/presentation/LanguageSwitcher.vue"
import Avatar from "primevue/avatar"
import { useUserNotificationsStore } from "@/modules/notifications/application/user-notifications.store.js"

const router = useRouter()
const notifsStore = useUserNotificationsStore()

const userName = ref("")
const userAvatar = ref("")
const mobileMenuOpen = ref(false)

const unreadCount = computed(() => notifsStore.unreadCount)

function goToProfile() {
  router.push('/user/profile')
}

onMounted(async () => {
  userName.value = localStorage.getItem("userName") || ""
  userAvatar.value = localStorage.getItem("userAvatar") || ""
  await notifsStore.syncSmartAlerts()
})
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

/* Notif Link & Badge */
.notif-link {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.notif-badge-counter {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #e11d48;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  border: 1.5px solid #fff;
  padding: 0 4px;
  box-shadow: 1px 1px 0 rgba(0,0,0,0.4);
}

/* Mobile Toggle */
.mobile-toggle-wrap {
  display: none;
  align-items: center;
  gap: 10px;
}

.mobile-menu-btn {
  width: 42px;
  height: 42px;
  border: 2px solid #333;
  background: #ffcd00;
  box-shadow: 2px 2px 0 #333;
  font-size: 1.25rem;
  display: grid;
  place-items: center;
  cursor: pointer;
}

/* Mobile Breakpoint */
@media (max-width: 860px) {
  .main-header {
    padding: 8px 16px;
  }
  .desktop-actions {
    display: none !important;
  }
  .mobile-toggle-wrap {
    display: flex !important;
  }
}

/* Mobile Drawer */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.mobile-drawer {
  width: 290px;
  max-width: 85vw;
  height: 100%;
  background: #fffdf8;
  border-left: 3px solid #333;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: -4px 0 15px rgba(0,0,0,0.15);
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #eee;
  margin-bottom: 16px;
}

.drawer-title {
  font-weight: 800;
  font-size: 1.1rem;
}

.drawer-close {
  background: none;
  border: 2px solid #333;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 2px 2px 0 #333;
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 2px solid #333;
  box-shadow: 2px 2px 0 #333;
  margin-bottom: 20px;
  cursor: pointer;
}

.drawer-user-info {
  display: flex;
  flex-direction: column;
}

.drawer-user-info small {
  color: #888;
}

.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid #333;
  background: #fff;
  box-shadow: 2px 2px 0 #333;
  text-decoration: none;
  color: #111;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.15s ease;
}

.mobile-nav-item:hover {
  background: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
}

.mobile-nav-item i {
  font-size: 1.2rem;
}

.mobile-notif-count {
  margin-left: auto;
  background: #e11d48;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.drawer-footer {
  margin-top: auto;
  padding-top: 20px;
}

.mobile-signup-btn {
  display: block;
  text-align: center;
  background: #ffcd00;
  color: #111;
  border: 2px solid #333;
  padding: 12px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 3px 3px 0 #333;
}

/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>