<template>
  <div class="user-notifs-page">
    <header class="page-head">
      <div class="head-text">
        <span class="r-kicker">🔔 {{ t('notifications.title') }}</span>
        <h1 class="r-page-title">{{ t('notifications.title') }}</h1>
        <p class="r-subtitle">{{ t('notifications.subtitle') }}</p>
      </div>

      <button
        v-if="store.notifications.length && store.unreadCount > 0"
        type="button"
        class="r-btn r-btn--ghost btn-mark-all"
        @click="store.markAllAsRead"
      >
        <i class="pi pi-check-circle"></i> {{ t('notifications.markAllRead') }}
      </button>
    </header>

    <div v-if="loading" class="notifs-list">
      <div v-for="n in 3" :key="n" class="skeleton-card"></div>
    </div>

    <div v-else-if="store.notifications.length" class="notifs-list">
      <article
        v-for="item in store.notifications"
        :key="item.id"
        class="notif-card"
        :class="{ unread: !item.read }"
        @click="handleClick(item)"
      >
        <div class="notif-icon-col">
          <div class="notif-icon-wrap" :class="item.type">
            <i :class="item.icon || 'pi pi-bell'"></i>
          </div>
        </div>

        <div class="notif-body">
          <div class="notif-top">
            <span class="notif-badge" :class="item.type">
              {{ formatType(item.type) }}
            </span>
            <span class="notif-time">{{ formatTime(item.timestamp) }}</span>
          </div>

          <h3 class="notif-title">{{ item.title }}</h3>
          <p class="notif-desc">{{ item.body }}</p>

          <div class="notif-actions" v-if="item.link">
            <span class="notif-link-hint">
              {{ t('tickets.viewEventBtn') }} <i class="pi pi-arrow-right"></i>
            </span>
          </div>
        </div>

        <div v-if="!item.read" class="unread-dot" title="No leído"></div>
      </article>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty r-card">
      <div class="empty-icon">🔕</div>
      <h2>{{ t('notifications.emptyTitle') }}</h2>
      <p>{{ t('notifications.emptyDesc') }}</p>
      <router-link to="/user/home">
        <button class="r-btn r-btn--primary">
          <i class="pi pi-compass"></i> {{ t('saved.explore') }}
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserNotificationsStore } from '@/modules/notifications/application/user-notifications.store.js'

const { t } = useI18n()
const router = useRouter()
const store = useUserNotificationsStore()
const loading = ref(true)

onMounted(async () => {
  await store.syncSmartAlerts()
  loading.value = false
})

function formatType(type) {
  if (type === 'reminder') return t('notifications.reminderType')
  if (type === 'category') return t('notifications.alertType')
  return t('notifications.purchaseType')
}

function formatTime(iso) {
  if (!iso) return t('notifications.timeJustNow')
  const d = new Date(iso)
  if (isNaN(d.getTime())) return t('notifications.timeJustNow')
  const diffHours = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return t('notifications.timeJustNow')
  if (diffHours < 24) return t('notifications.timeHoursAgo')
  const days = Math.round(diffHours / 24)
  return t('notifications.timeDaysAgo', { days })
}

function handleClick(item) {
  store.markAsRead(item.id)
  if (item.link) {
    router.push(item.link)
  }
}
</script>

<style scoped>
.user-notifs-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  font-family: inherit;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.r-kicker {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #555;
  background: #ffcd00;
  border: 1.5px solid #333;
  padding: 2px 8px;
  box-shadow: 2px 2px 0 #333;
  margin-bottom: 8px;
}

.r-page-title {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 800;
  margin: 0 0 6px 0;
  color: #111;
  letter-spacing: -0.02em;
}

.r-subtitle {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.btn-mark-all {
  height: 38px;
  padding: 0 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid #333;
  background: #fff;
  cursor: pointer;
  box-shadow: 2px 2px 0 #333;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-mark-all:hover {
  background: #fff7ed;
  border-color: #f59e0b;
}

.notifs-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notif-card {
  position: relative;
  display: flex;
  gap: 16px;
  background: #ffffff;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 #333;
  padding: 18px 20px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.notif-card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #333;
  background: #fffdf5;
}

.notif-card.unread {
  border-left: 6px solid #e11d48;
  background: #fffcf8;
}

.notif-icon-col {
  flex-shrink: 0;
}

.notif-icon-wrap {
  width: 44px;
  height: 44px;
  border: 2px solid #333;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  box-shadow: 2px 2px 0 #333;
}

.notif-icon-wrap.reminder {
  background: #fef08a;
  color: #854d0e;
}

.notif-icon-wrap.category {
  background: #bfdbfe;
  color: #1e40af;
}

.notif-icon-wrap.purchase {
  background: #bbf7d0;
  color: #166534;
}

.notif-body {
  flex-grow: 1;
}

.notif-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.notif-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border: 1px solid #333;
  border-radius: 2px;
}

.notif-badge.reminder { background: #fef9c3; color: #713f12; }
.notif-badge.category { background: #dbeafe; color: #1e3a8a; }
.notif-badge.purchase { background: #dcfce7; color: #14532d; }

.notif-time {
  font-size: 0.78rem;
  color: #888;
}

.notif-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #111;
}

.notif-desc {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
  margin: 0 0 8px 0;
}

.notif-link-hint {
  font-size: 0.82rem;
  font-weight: 600;
  color: #b45309;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.unread-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 10px;
  height: 10px;
  background-color: #e11d48;
  border-radius: 50%;
  border: 1.5px solid #fff;
}

.empty {
  text-align: center;
  background: #fff;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 #333;
  padding: 48px 24px;
  margin-top: 24px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.empty p {
  color: #666;
  max-width: 440px;
  margin: 0 auto 20px;
  line-height: 1.5;
}

.r-btn--primary {
  background: #ffcd00;
  color: #111;
  border: 2px solid #333;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 2px 2px 0 #333;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.skeleton-card {
  height: 90px;
  background: #eaeaea;
  border: 2px solid #ccc;
  animation: pulse 1.2s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
