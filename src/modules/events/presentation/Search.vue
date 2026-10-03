<template>
  <div class="search-page-container">
    <!-- Switcher de vista móvil (Lista / Mapa) -->
    <div class="mobile-view-switch" v-if="isMobile">
      <button
        class="switch-btn"
        :class="{ active: mobileTab === 'list' }"
        @click="setMobileTab('list')"
      >
        <i class="pi pi-list"></i> {{ $t('search.viewList') }}
      </button>
      <button
        class="switch-btn"
        :class="{ active: mobileTab === 'map' }"
        @click="setMobileTab('map')"
      >
        <i class="pi pi-map"></i> {{ $t('search.viewMap') }}
      </button>
    </div>

    <!-- Panel Izquierdo: Buscador, Filtros y Listado -->
    <div class="list-panel" :class="{ 'panel-hidden': isMobile && mobileTab !== 'list' }">
      <div class="panel-header">
        <h2 class="search-title">{{ $t('search.title') }}</h2>
        <span class="results-badge" v-if="filteredEvents.length">
          {{ filteredEvents.length }} {{ $t('search.resultsCount') }}
        </span>
      </div>

      <!-- Barra de búsqueda por texto -->
      <div class="search-bar-wrapper">
        <div class="input-icon-wrapper">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="query"
            @input="applyFilters"
            :placeholder="$t('search.placeholder')"
            class="search-input"
          />
          <button v-if="query" class="clear-btn" @click="query = ''; applyFilters()">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Filtros por Fecha -->
      <div class="filter-section">
        <div class="filter-header">
          <span class="filter-title"><i class="pi pi-calendar"></i> {{ $t('search.filterDate') }}:</span>
        </div>
        <div class="filter-chips date-chips">
          <button
            class="chip-btn"
            :class="{ active: selectedDate === 'all' }"
            @click="setDateFilter('all')"
          >
            {{ $t('search.allDates') }}
          </button>
          <button
            class="chip-btn"
            :class="{ active: selectedDate === 'today' }"
            @click="setDateFilter('today')"
          >
            {{ $t('search.today') }}
          </button>
          <button
            class="chip-btn"
            :class="{ active: selectedDate === 'weekend' }"
            @click="setDateFilter('weekend')"
          >
            {{ $t('search.thisWeekend') }}
          </button>
          <button
            class="chip-btn"
            :class="{ active: selectedDate === 'week' }"
            @click="setDateFilter('week')"
          >
            {{ $t('search.next7Days') }}
          </button>
        </div>
      </div>

      <!-- Filtros por Categoría -->
      <div class="filter-section">
        <div class="filter-header">
          <span class="filter-title"><i class="pi pi-tag"></i> {{ $t('search.filterCategory') }}:</span>
        </div>
        <div class="filter-chips category-chips">
          <button
            class="chip-btn"
            :class="{ active: selectedCategory === 'all' }"
            @click="setCategoryFilter('all')"
          >
            {{ $t('search.allCategories') }}
          </button>
          <button
            v-for="cat in availableCategories"
            :key="cat"
            class="chip-btn"
            :class="{ active: selectedCategory === cat }"
            @click="setCategoryFilter(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Listado de Eventos -->
      <div v-if="filteredEvents.length > 0" class="events-scroll-list">
        <EventCard
          v-for="event in filteredEvents"
          :key="event.id"
          :event="event"
          @mouseover="highlightMarker(event.id)"
          @mouseleave="resetMarkerHighlight()"
          class="event-card-item"
        />
      </div>

      <div v-else class="no-results-panel">
        <div class="empty-icon">🔍</div>
        <p class="no-results-text">{{ $t('search.noResults') }}</p>
        <button class="reset-filters-btn" @click="resetFilters">
          <i class="pi pi-refresh"></i> Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Panel Derecho: Mapa de Google Maps -->
    <div class="map-panel" :class="{ 'panel-hidden': isMobile && mobileTab !== 'map' }">
      <div id="map-search" class="map-search-canvas"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import http from "@/shared/infrastructure/http.js";
import EventCard from "@/modules/events/presentation/EventCard.vue";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA63CoEMd84d8bQBolX_gBrmksWBiev_vs";

const query = ref("");
const selectedCategory = ref("all");
const selectedDate = ref("all");
const events = ref([]);
const filteredEvents = ref([]);

// Mobile responsive control
const mobileTab = ref("list");
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 850;
};

const setMobileTab = (tab) => {
  mobileTab.value = tab;
  if (tab === "map" && map) {
    nextTick(() => {
      google.maps.event.trigger(map, "resize");
      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(m => bounds.extend(m.getPosition()));
        map.fitBounds(bounds);
      }
    });
  }
};

let map, geocoder;
let markers = [];
let activeInfoWindow = null;

// Categorías extraídas dinámicamente + sugerencias frecuentes
const availableCategories = computed(() => {
  const set = new Set();
  events.value.forEach(e => {
    if (e.category && e.category.trim()) {
      set.add(e.category.trim());
    }
  });
  // Fallbacks si la lista está vacía
  if (set.size === 0) {
    return ["Música", "Teatro", "Arte", "Gastronomía", "Tecnología", "Danza", "Ferias"];
  }
  return Array.from(set);
});

// Parsear formato lat,lng|Address
const parseLocation = (loc) => {
  if (!loc) return { lat: -12.0464, lng: -77.0428, address: "" };
  if (loc.includes('|')) {
    const [coords, address] = loc.split('|');
    const [lat, lng] = coords.split(',').map(Number);
    return { lat, lng, address };
  }
  return { lat: null, lng: null, address: loc };
};

// Cargar script de Google Maps dinámicamente
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

// Cargar eventos del backend
const loadEvents = async () => {
  try {
    const res = await http.get('/api/events');
    events.value = res.data.map(e => {
      const image = e.photos && e.photos.length > 0 
        ? e.photos[0] 
        : 'https://placehold.co/400x260?text=NextHappen';

      return {
        ...e,
        image
      };
    });
    applyFilters();
  } catch (error) {
    console.error("Error al cargar eventos en búsqueda:", error);
  }
};

// Inicializar mapa
const initSearchMap = () => {
  const mapElement = document.getElementById("map-search");
  if (!mapElement) return;

  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(mapElement, {
    center: { lat: -12.0464, lng: -77.0428 },
    zoom: 12,
  });

  updateMapMarkers();
};

// Actualizar marcadores al filtrar eventos
const updateMapMarkers = () => {
  if (!map) return;
  markers.forEach(m => m.setMap(null));
  markers = [];

  if (activeInfoWindow) activeInfoWindow.close();

  const bounds = new google.maps.LatLngBounds();
  let hasValidCoords = false;

  filteredEvents.value.forEach(ev => {
    const locData = parseLocation(ev.location);

    if (locData.lat && locData.lng) {
      const pos = { lat: locData.lat, lng: locData.lng };
      createMarker(ev, pos);
      bounds.extend(pos);
      hasValidCoords = true;
    } else if (locData.address || ev.address) {
      const addr = locData.address || ev.address;
      geocoder.geocode({ address: addr }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          const loc = results[0].geometry.location;
          createMarker(ev, loc);
          bounds.extend(loc);
          if (filteredEvents.value.length <= 5) map.fitBounds(bounds);
        }
      });
    }
  });

  if (hasValidCoords && filteredEvents.value.length > 0) {
    map.fitBounds(bounds);
    if (filteredEvents.value.length === 1) {
      map.setZoom(15);
    }
  }
};

// Crear un marcador con InfoWindow
const createMarker = (ev, position) => {
  const marker = new google.maps.Marker({
    position,
    map,
    title: ev.title,
    animation: google.maps.Animation.DROP
  });

  marker.eventId = ev.id;

  const priceText = ev.price && ev.price > 0 ? `S/. ${ev.price}` : "Gratuito";
  const contentString = `
    <div style="font-family: Arial, sans-serif; max-width: 220px; padding: 6px;">
      <img src="${ev.image}" alt="${ev.title}" style="width: 100%; height: 95px; object-fit: cover; border: 2px solid #111; margin-bottom: 8px;" />
      <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #111;">${ev.title}</h4>
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #f59e0b;">${ev.category || 'General'}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
        <span style="font-weight: 800; font-size: 13px; color: #111;">${priceText}</span>
        <a href="/user/publishment/${ev.id}" style="background-color: #ffcd00; border: 2px solid #111; text-decoration: none; color: #111; font-weight: 800; padding: 4px 8px; font-size: 11px;">Ver detalles</a>
      </div>
    </div>
  `;

  const infoWindow = new google.maps.InfoWindow({
    content: contentString
  });

  marker.addListener("click", () => {
    if (activeInfoWindow) activeInfoWindow.close();
    infoWindow.open(map, marker);
    activeInfoWindow = infoWindow;
  });

  markers.push(marker);
};

// Filtro combinado de búsqueda por texto, categoría y fecha (US06)
const applyFilters = () => {
  const q = query.value.toLowerCase().trim();
  const cat = selectedCategory.value;
  const dateFilter = selectedDate.value;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;

  // Fin de semana (próximo sábado y domingo)
  const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
  const daysUntilSaturday = currentDay === 6 ? 0 : currentDay === 0 ? -1 : 6 - currentDay;
  const weekendStart = todayStart + daysUntilSaturday * 86400000;
  const weekendEnd = weekendStart + 2 * 86400000;

  // Próximos 7 días
  const next7DaysEnd = todayStart + 7 * 86400000;

  filteredEvents.value = events.value.filter(e => {
    // 1. Filtro de texto (nombre, categoría, dirección o descripción)
    if (q) {
      const matchText =
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.address && e.address.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    // 2. Filtro de categoría
    if (cat !== "all") {
      if (!e.category || e.category.toLowerCase() !== cat.toLowerCase()) {
        return false;
      }
    }

    // 3. Filtro de fecha
    if (dateFilter !== "all") {
      const evDateRaw = e.startDate || e.dateRange?.startDate || e.date;
      if (!evDateRaw) return false;
      const evTime = new Date(evDateRaw).getTime();
      if (isNaN(evTime)) return false;

      if (dateFilter === "today") {
        if (evTime < todayStart || evTime >= todayEnd) return false;
      } else if (dateFilter === "weekend") {
        if (evTime < weekendStart || evTime >= weekendEnd) return false;
      } else if (dateFilter === "week") {
        if (evTime < todayStart || evTime >= next7DaysEnd) return false;
      }
    }

    return true;
  });

  updateMapMarkers();
};

const setCategoryFilter = (cat) => {
  selectedCategory.value = cat;
  applyFilters();
};

const setDateFilter = (filter) => {
  selectedDate.value = filter;
  applyFilters();
};

const resetFilters = () => {
  query.value = "";
  selectedCategory.value = "all";
  selectedDate.value = "all";
  applyFilters();
};

// Efecto visual al pasar el cursor sobre la tarjeta
const highlightMarker = (id) => {
  const marker = markers.find(m => m.eventId === id);
  if (marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
};

const resetMarkerHighlight = () => {
  markers.forEach(m => m.setAnimation(null));
};

onMounted(async () => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  await loadEvents();
  loadGoogleMapsScript(() => {
    nextTick(() => {
      initSearchMap();
    });
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style scoped>
.search-page-container {
  display: flex;
  height: calc(100vh - 72px);
  overflow: hidden;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  background-color: #faf9f6;
  position: relative;
}

/* Mobile View Switcher */
.mobile-view-switch {
  display: flex;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  background: white;
  border: 2px solid #111;
  box-shadow: 3px 3px 0 #111;
  border-radius: 999px;
  overflow: hidden;
}

.switch-btn {
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.switch-btn.active {
  background: #ffcd00;
  color: #111;
}

/* Panel Izquierdo */
.list-panel {
  width: 44%;
  min-width: 400px;
  max-width: 580px;
  background-color: #fcfbfa;
  border-right: 3px solid #111;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.search-title {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
  color: #111;
  letter-spacing: -0.02em;
}

.results-badge {
  font-size: 0.78rem;
  font-weight: 800;
  background: #ffcd00;
  color: #111;
  padding: 4px 8px;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
}

/* Input de búsqueda */
.search-bar-wrapper {
  margin-bottom: 1rem;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #555;
  font-size: 0.95rem;
}

.search-input {
  width: 100%;
  border: 2px solid #111;
  box-shadow: 3px 3px 0 #111;
  padding: 0.7rem 2.2rem 0.7rem 2.2rem;
  box-sizing: border-box;
  font-size: 0.92rem;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  background: white;
  transition: box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: #111;
  box-shadow: 4px 4px 0 #ffcd00;
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  padding: 4px;
}

.clear-btn:hover {
  color: #111;
}

/* Filtros por chips */
.filter-section {
  margin-bottom: 0.9rem;
}

.filter-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
}

.filter-title {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #444;
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-btn {
  padding: 5px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 2px solid #111;
  background: white;
  box-shadow: 2px 2px 0 #111;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
}

.chip-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #111;
}

.chip-btn.active {
  background: #111;
  color: #ffcd00;
  box-shadow: 2px 2px 0 #ffcd00;
}

/* Scroll list */
.events-scroll-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.events-scroll-list::-webkit-scrollbar {
  width: 6px;
}
.events-scroll-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border: 1px solid #111;
}

.event-card-item {
  border: 2px solid #111;
  box-shadow: 3px 3px 0 #111;
  background: white;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.event-card-item:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #111;
}

/* No results */
.no-results-panel {
  text-align: center;
  padding: 2.5rem 1rem;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.no-results-text {
  color: #444;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.reset-filters-btn {
  padding: 8px 16px;
  font-weight: 800;
  font-size: 0.85rem;
  background: #ffcd00;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.reset-filters-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #111;
}

/* Panel Derecho: Mapa */
.map-panel {
  flex: 1;
  height: 100%;
  position: relative;
}

.map-search-canvas {
  width: 100%;
  height: 100%;
}

/* Responsive */
@media (max-width: 850px) {
  .search-page-container {
    flex-direction: column;
    height: calc(100vh - 65px);
  }

  .list-panel {
    width: 100%;
    min-width: unset;
    max-width: unset;
    height: 100%;
    border-right: none;
    padding-top: 3.5rem; /* Deja espacio para el toggle móvil */
  }

  .map-panel {
    width: 100%;
    height: 100%;
    padding-top: 3.5rem;
  }

  .panel-hidden {
    display: none !important;
  }
}
</style>
