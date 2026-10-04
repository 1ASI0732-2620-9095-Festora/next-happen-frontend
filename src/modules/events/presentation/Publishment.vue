<template>
  <div class="publishment-page" v-if="event">
    <div class="event-header-top">
      <div class="header-badges">
        <span class="cat-pill" v-if="event.category">{{ displayCategory }}</span>
        <button class="translate-toggle-btn" @click="toggleTranslation">
          {{ isTranslated ? $t('publishment.translateToEs') : $t('publishment.translateToEn') }}
        </button>
      </div>

      <h1 class="title">{{ displayTitle }}</h1>

      <div v-if="isTranslated" class="translation-note">
        <i class="pi pi-sparkles"></i> {{ $t('publishment.translatedNotice') }}
      </div>

      <div class="header-meta">
        <p class="organizer-info">
          <strong>{{ $t('publishment.organizer') }}:</strong> {{ event.organizerName || event.organizer }}
        </p>

        <!-- Barra de compartir evento (US10) -->
        <div class="share-actions">
          <button class="share-btn share-native" @click="shareEvent" :title="$t('share.title')">
            <i class="pi pi-share-alt"></i> <span>{{ $t('share.button') }}</span>
          </button>
          <button class="share-btn share-wa" @click="shareWhatsApp" :title="$t('share.whatsapp')">
            <i class="pi pi-whatsapp"></i> <span>WhatsApp</span>
          </button>
          <button class="share-btn share-copy" @click="copyLink" :title="$t('share.copy')">
            <i :class="copied ? 'pi pi-check' : 'pi pi-copy'"></i>
            <span>{{ copied ? $t('share.copied') : $t('share.copy') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ==== Carrusel ==== -->
    <div class="carousel-container" v-if="event.photos && event.photos.length">
      <div class="carousel" ref="carousel">
        <div
          v-for="(photo, i) in event.photos"
          :key="i"
          class="carousel-card"
        >
          <img :src="photo" :alt="`${event.title} ${i + 1}`" />
        </div>
      </div>

      <button
        v-if="event.photos && event.photos.length > 1"
        class="btn prev"
        @click="move(-1)"
        aria-label="Anterior"
      >
        &#10094;
      </button>
      <button
        v-if="event.photos && event.photos.length > 1"
        class="btn next"
        @click="move(1)"
        aria-label="Siguiente"
      >
        &#10095;
      </button>
    </div>

    <!-- ==== Información general ==== -->
    <div class="event-details-layout">
      <div class="event-info-main">
        <p class="desc">{{ displayDescription }}</p>

        <div class="event-specs">
          <div class="spec-item">
            <i class="pi pi-calendar"></i>
            <div>
              <strong>{{ $t('publishment.dates') }}:</strong>
              <span>
                {{ event.startDate ? new Date(event.startDate).toLocaleDateString() : '' }}
                <span v-if="event.endDate"> - {{ new Date(event.endDate).toLocaleDateString() }}</span>
              </span>
            </div>
          </div>
          <div class="spec-item">
            <i class="pi pi-ticket"></i>
            <div>
              <strong>{{ $t('publishment.availableTickets') }}:</strong>
              <span>{{ event.quantity }}</span>
            </div>
          </div>
          <div class="spec-item">
            <i class="pi pi-money-bill"></i>
            <div>
              <strong>{{ $t('publishment.unitPrice') }}:</strong>
              <span>{{ event.price && event.price > 0 ? `S/. ${Number(event.price).toFixed(2)}` : $t('search.free') }}</span>
            </div>
          </div>
        </div>

        <!-- ==== Ubicación en el Mapa ==== -->
        <div class="map-section">
          <h3 class="section-subtitle">📍 {{ $t('publishment.locationTitle') }}</h3>
          <p v-if="event.address" class="address-text">
            <strong>{{ $t('publishment.address') }}:</strong> {{ event.address }}
          </p>
          <div id="map-publishment" class="publishment-map"></div>
        </div>
      </div>

      <!-- ==== Panel Lateral de Compra de Tickets ==== -->
      <aside class="purchase-sidebar">
        <div class="ticket-section">
          <h3 class="ticket-section-title">Comprar Entradas</h3>
          <label for="ticketCount" class="ticket-label"><strong>{{ $t('publishment.quantity') }}:</strong></label>
          <div class="ticket-input">
            <button class="btn-qty" @click="decreaseQuantity" aria-label="Disminuir">−</button>
            <input
              id="ticketCount"
              type="number"
              v-model.number="ticketCount"
              min="1"
              :max="event.quantity"
            />
            <button class="btn-qty" @click="increaseQuantity" aria-label="Aumentar">+</button>
          </div>

          <p class="total">
            <strong>{{ $t('publishment.total') }}:</strong> S/. {{ totalPrice.toFixed(2) }}
          </p>

          <div class="actions">
            <pv-button
              :label="buying ? $t('publishment.buyingBtn') : $t('publishment.buyBtn')"
              icon="pi pi-ticket"
              class="btn-buy"
              :disabled="buying || !event.quantity"
              @click="buyTicket"
            />
          </div>

          <p class="secure-note">🔒 {{ $t('publishment.secureNote') }}</p>
        </div>
      </aside>
    </div>

    <!-- ==== Reseñas del evento ==== -->
    <EventReviews :event-id="String(event.id)" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/shared/infrastructure/http.js'
import { PaymentsApi } from '@/modules/tickets/infrastructure/payments-api.js'
import EventReviews from '@/modules/events/presentation/EventReviews.vue'

const paymentsApi = new PaymentsApi()
const buying = ref(false)
const route = useRoute()
const event = ref(null)
const carousel = ref(null)
const copied = ref(false)
const isTranslated = ref(false)
let index = 0

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA63CoEMd84d8bQBolX_gBrmksWBiev_vs"

// ==== Tickets ====
const ticketCount = ref(1)
const totalPrice = computed(() => (event.value ? event.value.price * ticketCount.value : 0))

function increaseQuantity() {
  if (ticketCount.value < event.value.quantity) ticketCount.value++
}

function decreaseQuantity() {
  if (ticketCount.value > 1) ticketCount.value--
}

// ==== Traducción Dinámica (US35) ====
function toggleTranslation() {
  isTranslated.value = !isTranslated.value
}

// Diccionario de traducción asistida para eventos culturales peruanos
const spanishToEnglishDict = {
  "Feria": "Fair",
  "feria": "fair",
  "Artesanías": "Crafts",
  "artesanías": "crafts",
  "Primavera": "Spring",
  "Concierto": "Concert",
  "concierto": "concert",
  "Música": "Music",
  "música": "music",
  "Teatro": "Theater",
  "teatro": "theater",
  "Exposición": "Exhibition",
  "exposición": "exhibition",
  "Taller": "Workshop",
  "taller": "workshop",
  "Gastronomía": "Gastronomy",
  "gastronómico": "gastronomic",
  "Arte": "Art",
  "arte": "art",
  "independiente": "independent",
  "cultural": "cultural",
  "en vivo": "live",
  "entrada": "ticket",
  "general": "general",
  "Todos los públicos": "All audiences",
  "Disfruta": "Enjoy",
  "Ven y descubre": "Come and discover",
  "los mejores emprendedores": "the best entrepreneurs",
  "comida local": "local food",
  "música acústica": "acoustic music"
}

function translateText(text) {
  if (!text) return ''
  let translated = text
  for (const [es, en] of Object.entries(spanishToEnglishDict)) {
    const regex = new RegExp(`\\b${es}\\b`, 'gi')
    translated = translated.replace(regex, en)
  }
  return translated
}

const displayTitle = computed(() => {
  if (!event.value?.title) return ''
  if (!isTranslated.value) return event.value.title
  return translateText(event.value.title)
})

const displayDescription = computed(() => {
  if (!event.value?.description) return ''
  if (!isTranslated.value) return event.value.description
  return translateText(event.value.description)
})

const displayCategory = computed(() => {
  if (!event.value?.category) return ''
  if (!isTranslated.value) return event.value.category
  return translateText(event.value.category)
})

// ==== Compartir Evento (US10) ====
async function shareEvent() {
  const currentUrl = window.location.href
  const title = event.value ? event.value.title : 'NextHappen'
  const text = `¡Mira este evento en NextHappen! ${title}`

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: currentUrl
      })
      return
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
    }
  }
  // Fallback si no tiene navigator.share
  copyLink()
}

function shareWhatsApp() {
  const currentUrl = window.location.href
  const title = event.value ? event.value.title : 'NextHappen'
  const text = `¡Mira este evento en NextHappen! *${title}*: ${currentUrl}`
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(waUrl, '_blank')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (err) {
    console.error('Error copying to clipboard:', err)
  }
}

// ==== Ubicación y Mapas ====
const parseLocation = (loc) => {
  if (!loc) return { lat: -12.0464, lng: -77.0428, address: "" }
  if (loc.includes('|')) {
    const [coords, address] = loc.split('|')
    const [lat, lng] = coords.split(',').map(Number)
    return { lat, lng, address }
  }
  return { lat: null, lng: null, address: loc }
}

const loadGoogleMapsScript = (callback) => {
  if (window.google?.maps) {
    callback()
    return
  }
  const script = document.createElement("script")
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`
  script.async = true
  script.defer = true
  script.onload = callback
  document.head.appendChild(script)
}

const initPublishmentMap = () => {
  const element = document.getElementById("map-publishment")
  if (!element || !event.value) return

  const locData = parseLocation(event.value.location)
  const geocoder = new google.maps.Geocoder()

  let center = { lat: -12.0464, lng: -77.0428 }
  let zoom = 11

  if (locData.lat && locData.lng) {
    center = { lat: locData.lat, lng: locData.lng }
    zoom = 16
  }

  const map = new google.maps.Map(element, {
    center: center,
    zoom: zoom
  })

  if (locData.lat && locData.lng) {
    new google.maps.Marker({
      position: center,
      map: map
    })
  } else if (locData.address || event.value.address) {
    const addressToGeocode = locData.address || event.value.address
    geocoder.geocode({ address: addressToGeocode }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const loc = results[0].geometry.location
        map.setCenter(loc)
        map.setZoom(16)
        new google.maps.Marker({
          position: loc,
          map: map
        })
      }
    })
  }
}

onMounted(async () => {
  try {
    const res = await http.get(`/api/events/${route.params.id}`)
    event.value = res.data

    if (event.value.organizer) {
      try {
        const orgRes = await http.get(`/api/users/${event.value.organizer}`)
        event.value.organizerName = orgRes.data.fullName
      } catch (e) {
        event.value.organizerName = event.value.organizer
      }
    }

    await nextTick()
    applyTransform()
    loadGoogleMapsScript(() => {
      initPublishmentMap()
    })
  } catch (error) {
    console.error('Error cargando publicación:', error)
  }
})

function getCardWidth() {
  const first = carousel.value?.querySelector('.carousel-card')
  if (!first) return 0
  const rect = first.getBoundingClientRect()
  const style = getComputedStyle(first)
  const gap = parseFloat(style.marginRight) || 20
  return rect.width + gap
}

function applyTransform() {
  if (!carousel.value) return
  const shift = -index * getCardWidth()
  carousel.value.style.transform = `translateX(${shift}px)`
}

function clampIndex(idx) {
  const total = event.value?.photos?.length || 1
  const max = Math.max(0, total - getVisibleCount())
  return Math.min(Math.max(0, idx), max)
}

function getVisibleCount() {
  const width = window.innerWidth
  if (width < 600) return 1
  if (width < 1000) return 2
  return 3
}

function move(direction) {
  index = clampIndex(index + (direction === 1 ? 1 : -1))
  applyTransform()
}

async function buyTicket() {
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  if (!userId || !token) {
    alert("Debes iniciar sesión para comprar.")
    return
  }

  buying.value = true
  try {
    const { checkoutUrl } = await paymentsApi.createCheckout(
      event.value.id,
      ticketCount.value
    )
    window.location.href = checkoutUrl
  } catch (error) {
    console.error("Error al iniciar el pago:", error)
    const msg = error?.response?.data?.error ||
      "Ocurrió un error al procesar la compra. Intenta de nuevo."
    alert(msg)
    buying.value = false
  }
}
</script>

<style scoped>
.publishment-page {
  max-width: 1120px;
  margin: 32px auto;
  padding: 0 20px;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
}

.event-header-top {
  margin-bottom: 24px;
}

.header-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cat-pill {
  background: #ffcd00;
  color: #111;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 4px 10px;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
  text-transform: uppercase;
}

.translate-toggle-btn {
  background: white;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.translate-toggle-btn:hover {
  background: #ffcd00;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #111;
}

.title {
  text-align: left;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin: 0 0 10px 0;
  color: #111;
}

.translation-note {
  font-size: 0.85rem;
  color: #d97706;
  font-weight: 700;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.organizer-info {
  margin: 0;
  font-size: 1.05rem;
  color: #333;
}

/* Barra de compartir */
.share-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
  background: white;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}

.share-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #111;
}

.share-wa:hover {
  background: #25D366;
  color: white;
}

.share-copy.active, .share-copy:hover {
  background: #ffcd00;
}

/* ==== Carrusel ==== */
.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 20px 0 32px 0;
  border: 2px solid #111;
  box-shadow: 4px 4px 0 #111;
  background: #faf8f5;
  padding: 12px;
}

.carousel {
  display: flex;
  gap: 16px;
  transition: transform 0.4s ease;
}

.carousel-card {
  flex: 0 0 calc(33.33% - 12px);
  background: #fff;
  border: 2px solid #111;
  overflow: hidden;
  height: 240px;
}

.carousel-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Botones laterales del carrusel */
.btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #ffcd00;
  border: 2px solid #111;
  box-shadow: 3px 3px 0 #111;
  color: #111;
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;
  z-index: 5;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}

.btn:hover {
  background-color: white;
  transform: translateY(-50%) translate(-1px, -1px);
  box-shadow: 4px 4px 0 #111;
}

.prev { left: 1rem; }
.next { right: 1rem; }

/* Layout principal: contenido y sidebar */
.event-details-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
}

.desc {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #222;
  margin-top: 0;
  margin-bottom: 24px;
}

.event-specs {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fbf9f4;
  border: 2px solid #111;
  padding: 16px 20px;
  margin-bottom: 28px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
}

.spec-item i {
  font-size: 1.2rem;
  color: #111;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.address-text {
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.publishment-map {
  height: 320px;
  border: 2px solid #111;
  box-shadow: 3px 3px 0 #111;
  background: #eee;
}

/* Purchase Sidebar */
.purchase-sidebar {
  position: sticky;
  top: 90px;
}

.ticket-section {
  border: 2px solid #111;
  box-shadow: 4px 4px 0 #111;
  background: #fffbe8;
  padding: 24px;
}

.ticket-section-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 16px;
  border-bottom: 2px solid #111;
  padding-bottom: 8px;
}

.ticket-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.ticket-input {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.ticket-input input {
  width: 70px;
  text-align: center;
  border: 2px solid #111;
  height: 38px;
  font-weight: 800;
  font-size: 1rem;
  margin: 0 8px;
  outline: none;
}

.btn-qty {
  background: #ffcd00;
  border: 2px solid #111;
  font-size: 1.2rem;
  font-weight: 800;
  width: 38px;
  height: 38px;
  cursor: pointer;
  box-shadow: 2px 2px 0 #111;
  transition: all 0.1s ease;
}

.btn-qty:hover {
  background: white;
  transform: translate(-1px, -1px);
}

.total {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 16px 0;
  color: #111;
}

.actions {
  margin-top: 16px;
}

.btn-buy {
  width: 100%;
  justify-content: center;
  background-color: #ffcd00;
  border: 2px solid #111;
  padding: 12px 18px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 #111;
  color: #111;
}

:deep(.btn-buy:hover) {
  background-color: #111 !important;
  color: #ffcd00 !important;
  border-color: #111 !important;
}

.secure-note {
  text-align: center;
  margin-top: 14px;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Responsivo */
@media (max-width: 900px) {
  .event-details-layout {
    grid-template-columns: 1fr;
  }

  .carousel-card {
    flex: 0 0 calc(50% - 12px);
  }

  .purchase-sidebar {
    position: static;
    margin-top: 24px;
  }
}

@media (max-width: 600px) {
  .publishment-page {
    margin: 20px auto;
    padding: 0 14px;
  }

  .carousel-card {
    flex: 0 0 100%;
  }

  .header-badges {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
