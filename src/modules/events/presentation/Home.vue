<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-text">
        <span class="r-kicker">{{ $t('hero.discover') }}</span>
        <h1 class="hero-title">{{ $t('hero.titlePrefix') }}<br /><span class="hl">{{ $t('hero.titleHighlight') }}</span></h1>
        <p class="hero-sub">
          {{ $t('hero.subtitle') }}
        </p>
        <div class="hero-actions">
          <button class="r-btn r-btn--primary r-btn--lg" @click="$router.push({ name: 'user-search' })">
            <i class="pi pi-search"></i> {{ $t('hero.searchBtn') }}
          </button>
          <button class="r-btn r-btn--ghost r-btn--lg" @click="$router.push({ name: 'user-events' })">
            {{ $t('hero.allBtn') }}
          </button>
          <button class="r-btn r-btn--outline r-btn--lg interests-hero-btn" @click="openInterestsModal">
            <i class="pi pi-sliders-h"></i> {{ $t('hero.interestsBtn') }}
          </button>
        </div>
      </div>
      <div class="hero-stat">
        <span class="stat-num">{{ events.length }}</span>
        <span class="stat-label">{{ $t('hero.activeEvents') }}</span>
      </div>
    </section>

    <!-- Filtro por categoría rápida -->
    <section v-if="categories.length" class="cats">
      <button
        class="cat"
        :class="{ active: activeCat === null }"
        @click="activeCat = null"
      >{{ $t('common.all') }}</button>
      <button
        v-for="c in categories"
        :key="c"
        class="cat"
        :class="{ active: activeCat === c }"
        @click="activeCat = activeCat === c ? null : c"
      >
        {{ c }}
        <span v-if="subscribedCategories.includes(c)" class="cat-dot" title="Suscrito">★</span>
      </button>
    </section>

    <!-- Recomendados Personalizados (US17) -->
    <section v-if="!loading && recommended.length" class="block">
      <div class="block-head">
        <div class="block-title-wrap">
          <h2 class="r-display block-title">✨ {{ $t('hero.recommended') }}</h2>
          <span v-if="subscribedCategories.length" class="personalized-badge">
            <i class="pi pi-star-fill"></i> {{ $t('interests.badge') }}
          </span>
        </div>
        <small class="block-hint">{{ $t('hero.recommendedSub') }}</small>
      </div>
      <div class="grid">
        <EventPoster v-for="ev in recommended" :key="ev.id" :event="ev" />
      </div>
    </section>

    <!-- Próximos -->
    <section v-if="!loading && upcoming.length" class="block">
      <div class="block-head">
        <h2 class="r-display block-title">🗓️ {{ $t('hero.upcoming') }}</h2>
      </div>
      <div class="grid">
        <EventPoster v-for="ev in upcoming" :key="ev.id" :event="ev" />
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="grid">
      <div v-for="n in 6" :key="n" class="skeleton"></div>
    </div>

    <!-- Empty -->
    <div v-if="!loading && !events.length" class="empty r-card">
      <div class="empty-icon">🎪</div>
      <h2>{{ $t('hero.emptyTitle') }}</h2>
      <p>{{ $t('hero.emptyDesc') }}</p>
    </div>

    <!-- Modal de Suscripción a Categorías e Intereses (US16) -->
    <div v-if="showInterestsModal" class="interests-modal-backdrop" @click.self="showInterestsModal = false">
      <div class="interests-modal r-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">🎯 {{ $t('interests.title') }}</h3>
            <p class="modal-subtitle">{{ $t('interests.subtitle') }}</p>
          </div>
          <button class="modal-close-btn" @click="showInterestsModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="interests-options">
          <label
            v-for="cat in allAvailableCategories"
            :key="cat"
            class="interest-pill"
            :class="{ active: tempSubscribed.includes(cat) }"
          >
            <input
              type="checkbox"
              :value="cat"
              v-model="tempSubscribed"
              class="interest-checkbox"
            />
            <span class="pill-check-icon">{{ tempSubscribed.includes(cat) ? '✓' : '+' }}</span>
            <span class="pill-label">{{ cat }}</span>
          </label>
        </div>

        <div class="modal-actions">
          <button class="r-btn r-btn--ghost" @click="showInterestsModal = false">
            {{ $t('common.cancel') }}
          </button>
          <button class="r-btn r-btn--primary" @click="saveInterests">
            <i class="pi pi-check"></i> {{ $t('interests.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import EventPoster from '@/modules/events/presentation/EventPoster.vue'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useSavedStore } from '@/modules/events/application/saved.store.js'
import { useUserNotificationsStore } from '@/modules/notifications/application/user-notifications.store.js'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')
const savedStore = useSavedStore()
const notificationsStore = useUserNotificationsStore()

const events = ref([])
const loading = ref(true)
const activeCat = ref(null)

// Suscripción de categorías e intereses (US16 / US17)
const showInterestsModal = ref(false)
const subscribedCategories = ref([])
const tempSubscribed = ref([])

const defaultCategories = [
  'Música',
  'Teatro',
  'Arte',
  'Gastronomía',
  'Tecnología',
  'Danza',
  'Ferias',
  'Diseño',
  'Fotografía'
]

const categories = computed(() => {
  const set = new Set(events.value.map(e => e.category).filter(Boolean))
  return [...set].slice(0, 8)
})

const allAvailableCategories = computed(() => {
  const set = new Set([...defaultCategories, ...events.value.map(e => e.category).filter(Boolean)])
  return Array.from(set)
})

const filtered = computed(() =>
  activeCat.value ? events.value.filter(e => e.category === activeCat.value) : events.value
)

function openInterestsModal() {
  tempSubscribed.value = [...subscribedCategories.value]
  showInterestsModal.value = true
}

function saveInterests() {
  subscribedCategories.value = [...tempSubscribed.value]
  localStorage.setItem('nh_subscribed_categories', JSON.stringify(subscribedCategories.value))
  showInterestsModal.value = false

  // Notificar al store de alertas (US16 / US29)
  notificationsStore.syncSmartAlerts(events.value)
}

// Recomendados adaptados según intereses y guardados (US17 Personalización)
const recommended = computed(() => {
  const savedRaw = JSON.parse(localStorage.getItem('nh_saved') || '[]')
  const savedCats = new Set(
    events.value.filter(e => savedRaw.includes(e.id)).map(e => e.category)
  )
  const userSubs = new Set(subscribedCategories.value)
  const now = Date.now()

  const score = (e) => {
    let s = 0
    // Si la categoría coincide con las suscritas por el usuario, dar prioridad alta (+50 pts)
    if (e.category && userSubs.has(e.category)) {
      s += 50
    }
    // Si la categoría coincide con eventos previamente guardados (+20 pts)
    if (savedCats.has(e.category)) {
      s += 20
    }
    const start = new Date(e.startDate || e.dateRange?.startDate).getTime()
    if (!isNaN(start)) {
      const days = (start - now) / 86400000
      if (days >= 0) {
        s += Math.max(0, 12 - days / 7)
      }
    }
    return s
  }

  return [...filtered.value].sort((a, b) => score(b) - score(a)).slice(0, 6)
})

const upcoming = computed(() => {
  const now = Date.now()
  return [...filtered.value]
    .map(e => ({ e, t: new Date(e.startDate || e.dateRange?.startDate).getTime() }))
    .sort((a, b) => {
      const af = isNaN(a.t) || a.t < now ? Infinity : a.t
      const bf = isNaN(b.t) || b.t < now ? Infinity : b.t
      return af - bf
    })
    .map(x => x.e)
    .slice(0, 8)
})

onMounted(async () => {
  savedStore.loadSaved()

  // Cargar intereses guardados en localStorage
  try {
    const rawSubs = localStorage.getItem('nh_subscribed_categories')
    if (rawSubs) {
      subscribedCategories.value = JSON.parse(rawSubs)
    }
  } catch (err) {
    console.error('Error cargando suscripciones de categorías:', err)
  }

  try {
    const res = await axios.get(`${API}/api/events/public`)
    events.value = res.data.map(e => ({
      ...e,
      image: e.photos?.length ? e.photos[0] : 'https://placehold.co/400x260?text=NextHappen'
    }))

    // Sincronizar notificaciones automáticas para recordatorios y categorías
    notificationsStore.syncSmartAlerts(events.value)
  } catch (err) {
    console.error('Error cargando eventos:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home { max-width: 1160px; margin: 0 auto; padding: 32px 24px 64px; }

/* Hero */
.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border: var(--r-bd-3);
  box-shadow: var(--r-sh-pop);
  background: var(--r-brand);
  padding: 40px 36px;
  margin-bottom: 32px;
}
.hero-title {
  font-family: var(--r-font-display);
  font-size: clamp(1.9rem, 4.5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 12px 0;
  color: var(--r-ink);
}
.hero-title .hl {
  background: var(--r-ink);
  color: var(--r-brand);
  padding: 0 8px;
  display: inline-block;
}
.hero-sub { color: #4a4436; max-width: 46ch; margin: 0 0 22px; line-height: 1.55; font-weight: 500; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.interests-hero-btn {
  background: white;
  color: #111;
  border: 2px solid #111;
  font-weight: 700;
}
.interests-hero-btn:hover {
  background: #111;
  color: #ffcd00;
}

.hero-stat {
  flex-shrink: 0;
  border: var(--r-bd-3);
  background: var(--r-surface);
  box-shadow: var(--r-sh-3);
  padding: 22px 28px;
  text-align: center;
}
.stat-num { display: block; font-family: var(--r-font-mono); font-size: 3rem; font-weight: 700; line-height: 1; }
.stat-label { font-family: var(--r-font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--r-ink-soft); }

/* Categorías */
.cats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.cat {
  font-family: var(--r-font-body); font-weight: 600; font-size: 0.9rem;
  padding: 8px 16px; border: var(--r-bd); background: var(--r-surface); cursor: pointer;
  box-shadow: var(--r-sh-1);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform var(--r-dur) var(--r-ease), box-shadow var(--r-dur) var(--r-ease), background var(--r-dur) var(--r-ease);
}
.cat:hover { transform: translate(-1px, -1px); box-shadow: var(--r-sh-2); }
.cat.active { background: var(--r-ink); color: var(--r-bg); }
.cat-dot {
  color: #f59e0b;
  font-size: 0.85rem;
}

/* Bloques */
.block { margin-bottom: 40px; }
.block-head { display: flex; flex-direction: column; gap: 4px; margin-bottom: 18px; }
.block-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.block-title { font-size: 1.55rem; font-weight: 700; margin: 0; }
.block-hint { color: var(--r-ink-soft); }

.personalized-badge {
  background: #111;
  color: #ffcd00;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 22px; }

.skeleton {
  aspect-ratio: 16 / 13;
  border: var(--r-bd); box-shadow: var(--r-sh-2);
  background: linear-gradient(100deg, #f3f1ea 30%, #fbf9f2 50%, #f3f1ea 70%);
  background-size: 200% 100%; animation: sk 1.2s ease-in-out infinite;
}
@keyframes sk { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty { text-align: center; padding: 48px 32px; max-width: 480px; margin: 20px auto; }
.empty-icon { font-size: 3.2rem; }
.empty h2 { font-family: var(--r-font-display); margin: 12px 0 8px; }
.empty p { color: var(--r-ink-soft); }

/* Modal de Intereses (US16) */
.interests-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.interests-modal {
  background: white;
  border: 3px solid #111;
  box-shadow: 6px 6px 0 #111;
  max-width: 520px;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  border-bottom: 2px solid #111;
  padding-bottom: 12px;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 6px 0;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
}

.interests-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.interest-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
  background: #faf8f5;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.88rem;
  transition: all 0.15s ease;
  user-select: none;
}

.interest-pill:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #111;
}

.interest-pill.active {
  background: #ffcd00;
  border-color: #111;
  box-shadow: 2px 2px 0 #111;
}

.interest-checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.pill-check-icon {
  font-weight: 900;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  border-top: 2px solid #111;
  padding-top: 16px;
}

@media (max-width: 640px) {
  .hero { flex-direction: column; align-items: flex-start; }
  .hero-stat { align-self: stretch; }
}
</style>
