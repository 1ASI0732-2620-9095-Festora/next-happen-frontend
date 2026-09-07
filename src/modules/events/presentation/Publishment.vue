<template>
  <div class="publishment-page" v-if="event">
    <h1 class="title">{{ event.title }}</h1>
    <p><strong>Organizador:</strong> {{ event.organizerName || event.organizer }}</p>

    <!-- ==== Carrusel ==== -->
    <div class="carousel-container">
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
      >
        &#10094;
      </button>
      <button
        v-if="event.photos && event.photos.length > 1"
        class="btn next"
        @click="move(1)"
      >
        &#10095;
      </button>
    </div>

    <!-- ==== Información general ==== -->
    <p class="desc">{{ event.description }}</p>
    <p>
  <strong>Fecha:</strong>
  {{ event.startDate ? new Date(event.startDate).toLocaleDateString() : '' }}
  -
  {{ event.endDate ? new Date(event.endDate).toLocaleDateString() : '' }}
</p>
    <p><strong>Entradas disponibles:</strong> {{ event.quantity }}</p>
    <p><strong>Precio unitario:</strong> S/. {{ event.price }}</p>

    <!-- ==== Ubicación en el Mapa ==== -->
    <div class="map-section" style="margin-top: 20px; margin-bottom: 20px;">
      <h3 style="margin-bottom: 8px;">📍 Ubicación del Evento</h3>
      <p v-if="event.address"><strong>Dirección:</strong> {{ event.address }}</p>
      <div id="map-publishment" style="height: 300px; border: 2px solid #333; margin-top: 10px; background: #eee;"></div>
    </div>

    <!-- ==== Selector de cantidad ==== -->
    <div class="ticket-section">

      <label for="ticketCount"><strong>Cantidad de entradas:</strong></label>
      <div class="ticket-input">
        <button class="btn-qty" @click="decreaseQuantity">−</button>
        <input
          id="ticketCount"
          type="number"
          v-model.number="ticketCount"
          min="1"
          :max="event.quantity"
        />
        <button class="btn-qty" @click="increaseQuantity">+</button>
      </div>

      <p class="total">
        <strong>Total:</strong> S/. {{ totalPrice.toFixed(2) }}
      </p>
    </div>

    <!-- ==== Botón de acción ==== -->
    <div class="actions">
      <pv-button
        :label="buying ? 'Redirigiendo a Stripe...' : 'Comprar entrada'"
        icon="pi pi-ticket"
        class="btn-buy"
        :disabled="buying || !event.quantity"
        @click="buyTicket"
      />
    </div>

    <p class="secure-note">🔒 Pago seguro procesado por Stripe.</p>

    <!-- ==== Reseñas del evento ==== -->
    <EventReviews :event-id="String(event.id)" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { PaymentsApi } from '@/modules/tickets/infrastructure/payments-api.js'
import EventReviews from '@/modules/events/presentation/EventReviews.vue'

const paymentsApi = new PaymentsApi()
const buying = ref(false)
const route = useRoute()
const event = ref(null)
const carousel = ref(null)
let index = 0

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA63CoEMd84d8bQBolX_gBrmksWBiev_vs";


// ==== Tickets ====
const ticketCount = ref(1)
const totalPrice = computed(() => (event.value ? event.value.price * ticketCount.value : 0))

function increaseQuantity() {
  if (ticketCount.value < event.value.quantity) ticketCount.value++
}

function decreaseQuantity() {
  if (ticketCount.value > 1) ticketCount.value--
}

const parseLocation = (loc) => {
  if (!loc) return { lat: -12.0464, lng: -77.0428, address: "" };
  if (loc.includes('|')) {
    const [coords, address] = loc.split('|');
    const [lat, lng] = coords.split(',').map(Number);
    return { lat, lng, address };
  }
  return { lat: null, lng: null, address: loc };
};

const loadGoogleMapsScript = (callback) => {
  if (window.google?.maps) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
};

const initPublishmentMap = () => {
  const element = document.getElementById("map-publishment");
  if (!element || !event.value) return;

  const locData = parseLocation(event.value.location);
  const geocoder = new google.maps.Geocoder();

  let center = { lat: -12.0464, lng: -77.0428 };
  let zoom = 11;

  if (locData.lat && locData.lng) {
    center = { lat: locData.lat, lng: locData.lng };
    zoom = 16;
  }

  const map = new google.maps.Map(element, {
    center: center,
    zoom: zoom
  });

  if (locData.lat && locData.lng) {
    new google.maps.Marker({
      position: center,
      map: map
    });
  } else if (locData.address || event.value.address) {
    const addressToGeocode = locData.address || event.value.address;
    geocoder.geocode({ address: addressToGeocode }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const loc = results[0].geometry.location;
        map.setCenter(loc);
        map.setZoom(16);
        new google.maps.Marker({
          position: loc,
          map: map
        });
      }
    });
  }
};

onMounted(async () => {
  const res = await axios.get(`${API_URL}/api/events/${route.params.id}`)
  event.value = res.data

  // Fetch organizer name
  if (event.value.organizer) {
    try {
      const orgRes = await axios.get(`${API_URL}/api/users/${event.value.organizer}`)
      event.value.organizerName = orgRes.data.fullName
    } catch (e) {
      event.value.organizerName = event.value.organizer
    }
  }

  await nextTick()
  applyTransform()
  loadGoogleMapsScript(() => {
    initPublishmentMap();
  });
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
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    alert("Debes iniciar sesión para comprar.");
    return;
  }

  buying.value = true;
  try {
    // Crea la sesión de Stripe Checkout y redirige a la pasarela de pago.
    // Las entradas SOLO se emiten cuando Stripe confirma el pago (webhook).
    const { checkoutUrl } = await paymentsApi.createCheckout(
      event.value.id,
      ticketCount.value
    );
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error("Error al iniciar el pago:", error);
    const msg = error?.response?.data?.error ||
      "Ocurrió un error al procesar la compra. Intenta de nuevo.";
    alert(msg);
    buying.value = false;
  }
}
</script>

<style scoped>
.title {
  text-align: center;
  font-family: var(--r-font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  text-wrap: balance;
}

/* ==== Carrusel con separación ==== */
.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel {
  display: flex;
  gap: 20px;
  transition: transform 0.4s ease;
}

.carousel-card {
  flex: 0 0 calc(33.33% - 20px);
  background: #fff;
  border: 2px solid #333;
  border-radius: 0;
  overflow: hidden;
}

.carousel-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Botones laterales */
.btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #ffcd00;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 5;
  width: 45px;
  height: 45px;
}

.btn:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.prev {
   left: 1.25rem;
}

.next {
   right: 1.25rem;
}

/* ==== Resto ==== */
.publishment-page {
  margin: 40px;
  font-family: "Inter", sans-serif;
}

.desc {
  font-size: 1.05rem;
  margin-bottom: 16px;
}

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px; /* 🔹 Opcional: separación lateral */
}

.btn-buy {
  align-items: center;
  background-color: #ffcd00;
  border: 2px solid #333;
  padding: 8px 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
}

:deep(.btn-buy:hover) {
  border: 2px solid #f59e0b;
  color: #f59e0b;
  background-color: #ffffff;
  box-shadow: none;
}

.secure-note {
  text-align: right;
  padding-right: 20px;
  margin-top: 8px;
  color: #555;
  font-size: 0.9rem;
}

.ticket-input {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.ticket-input input {
  width: 60px;
  text-align: center;
  border: 2px solid #333;
  height: 33px;
  font-weight: 600;
  margin: 0 8px;
}

.btn-qty {
  background: #ffcd00;
  border: 2px solid #333;
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  cursor: pointer;
  gap: 2px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
}

.btn-qty:hover {
  background: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow: none;
}

.ticket-section {
  border: var(--r-bd, 2px solid #1b1a17);
  box-shadow: var(--r-sh-2, 4px 4px 0 #1b1a17);
  background: var(--r-surface-2, #fffbe8);
  padding: 18px 20px;
  margin-top: 24px;
  max-width: 340px;
}
.total {
  margin-top: 1rem;
  font-size: 1.15rem;
  font-weight: 700;
  font-family: var(--r-font-mono, 'Space Mono', monospace);
}

/* 📱 Responsivo */
@media (max-width: 1000px) {
  .carousel-card {
    flex: 0 0 calc(50% - 20px);
  }
}

@media (max-width: 600px) {
  .carousel-card {
    flex: 0 0 100%;
  }
}
</style>
