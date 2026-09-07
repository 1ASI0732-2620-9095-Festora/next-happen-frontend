<template>
  <section class="reviews">
    <h3 class="reviews-title">⭐ Reseñas y calificaciones</h3>

    <!-- Resumen -->
    <div class="reviews-summary">
      <div class="avg-box">
        <span class="avg-number">{{ summary.average.toFixed(1) }}</span>
        <div class="avg-stars" aria-hidden="true">
          <span v-for="i in 5" :key="i" :class="['star', { filled: i <= Math.round(summary.average) }]">★</span>
        </div>
        <small>{{ summary.count }} reseña(s)</small>
      </div>

      <div class="dist">
        <div v-for="n in [5, 4, 3, 2, 1]" :key="n" class="dist-row">
          <span class="dist-label">{{ n }}★</span>
          <div class="dist-bar">
            <div class="dist-fill" :style="{ width: barWidth(n) }"></div>
          </div>
          <span class="dist-count">{{ summary.distribution?.[n] || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Formulario para dejar reseña (solo usuarios logueados) -->
    <div v-if="canReview" class="review-form">
      <h4>{{ myReviewExists ? 'Actualiza tu reseña' : 'Deja tu reseña' }}</h4>
      <div class="star-picker">
        <span
          v-for="i in 5"
          :key="i"
          :class="['star', 'pick', { filled: i <= (hover || form.rating) }]"
          @mouseenter="hover = i"
          @mouseleave="hover = 0"
          @click="form.rating = i"
        >★</span>
      </div>
      <textarea
        v-model="form.comment"
        class="review-textarea"
        rows="3"
        maxlength="1000"
        placeholder="Cuéntanos tu experiencia..."
      ></textarea>
      <div class="form-actions">
        <button class="r-btn r-btn--primary" :disabled="submitting || form.rating < 1" @click="submit">
          {{ submitting ? 'Enviando…' : 'Publicar reseña' }}
        </button>
        <span v-if="error" class="err">{{ error }}</span>
      </div>
    </div>
    <p v-else class="login-hint">Inicia sesión como usuario para dejar una reseña.</p>

    <!-- Lista -->
    <div v-if="summary.items?.length" class="review-list">
      <div v-for="r in summary.items" :key="r.id" class="review-item">
        <div class="review-head">
          <strong>{{ r.userName || 'Usuario' }}</strong>
          <span class="review-stars">
            <span v-for="i in 5" :key="i" :class="['star', { filled: i <= r.rating }]">★</span>
          </span>
        </div>
        <p class="review-comment">{{ r.comment }}</p>
        <small class="review-date">{{ formatDate(r.createdAt) }}</small>
      </div>
    </div>
    <p v-else class="no-reviews">Todavía no hay reseñas. ¡Sé el primero!</p>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ReviewsApi } from '@/modules/events/infrastructure/reviews-api.js'

const props = defineProps({
  eventId: { type: String, required: true }
})

const reviewsApi = new ReviewsApi()
const summary = ref({ average: 0, count: 0, distribution: {}, items: [] })
const form = ref({ rating: 0, comment: '' })
const hover = ref(0)
const submitting = ref(false)
const error = ref('')

const role = localStorage.getItem('role')
const userId = localStorage.getItem('userId')
const canReview = computed(() => !!userId && role === 'User')
const myReviewExists = computed(() =>
  summary.value.items?.some(r => r.userId === userId)
)

function barWidth(n) {
  const count = summary.value.distribution?.[n] || 0
  const total = summary.value.count || 0
  return total ? `${Math.round((count / total) * 100)}%` : '0%'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-PE', { dateStyle: 'medium' })
}

async function load() {
  try {
    summary.value = await reviewsApi.getForEvent(props.eventId)
    const mine = summary.value.items?.find(r => r.userId === userId)
    if (mine) {
      form.value.rating = mine.rating
      form.value.comment = mine.comment
    }
  } catch (e) {
    console.error('Error cargando reseñas:', e)
  }
}

async function submit() {
  error.value = ''
  if (form.value.rating < 1) {
    error.value = 'Selecciona una calificación.'
    return
  }
  submitting.value = true
  try {
    await reviewsApi.submit(props.eventId, form.value.rating, form.value.comment)
    await load()
  } catch (e) {
    error.value = e?.response?.data?.error || 'No se pudo enviar la reseña.'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.reviews {
  margin-top: 44px;
  padding-top: 24px;
  border-top: var(--r-bd);
}
.reviews-title {
  font-family: var(--r-font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
}

.reviews-summary {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 26px;
  border: var(--r-bd);
  box-shadow: var(--r-sh-2);
  background: var(--r-surface);
  padding: 20px 22px;
}
.avg-box { text-align: center; min-width: 96px; }
.avg-number { font-family: var(--r-font-mono); font-size: 2.8rem; font-weight: 700; line-height: 1; }
.avg-stars { margin: 6px 0; }
.avg-box small { color: var(--r-ink-soft); font-family: var(--r-font-mono); font-size: 0.72rem; }
.star { color: #d8d3c8; font-size: 1.15rem; }
.star.filled { color: var(--r-star); }

.dist { flex: 1; min-width: 240px; }
.dist-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.dist-label { width: 28px; font-size: 0.82rem; font-family: var(--r-font-mono); }
.dist-bar { flex: 1; height: 12px; background: #f0ede4; border: var(--r-bd); }
.dist-fill { height: 100%; background: var(--r-star); }
.dist-count { width: 24px; text-align: right; font-size: 0.82rem; font-family: var(--r-font-mono); color: var(--r-ink-soft); }

.review-form {
  border: var(--r-bd);
  background: var(--r-surface-2);
  padding: 18px;
  box-shadow: var(--r-sh-2);
  margin-bottom: 26px;
}
.review-form h4 { font-family: var(--r-font-display); margin: 0 0 10px; }
.star-picker .pick { font-size: 1.9rem; cursor: pointer; transition: transform var(--r-dur) var(--r-ease); }
.star-picker .pick:hover { transform: scale(1.12); }
.review-textarea {
  width: 100%;
  border: var(--r-bd);
  box-shadow: var(--r-sh-1);
  padding: 10px;
  margin-top: 10px;
  font-family: var(--r-font-body);
  resize: vertical;
}
.review-textarea:focus { outline: none; box-shadow: var(--r-sh-2); }
.form-actions { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.err { color: var(--r-danger); font-size: 0.9rem; font-weight: 600; }
.login-hint, .no-reviews { color: var(--r-ink-soft); margin-bottom: 20px; }

.review-list { display: flex; flex-direction: column; gap: 12px; }
.review-item {
  border: var(--r-bd);
  box-shadow: var(--r-sh-1);
  padding: 14px 16px;
  background: var(--r-surface);
}
.review-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.review-head strong { font-family: var(--r-font-display); }
.review-stars .star { font-size: 1rem; }
.review-comment { margin: 8px 0; line-height: 1.55; }
.review-date { color: var(--r-ink-faint); font-family: var(--r-font-mono); font-size: 0.72rem; }
</style>
