<template>
  <div class="search-page-container">
    <!-- Panel Izquierdo: Buscador y Listado -->
    <div class="list-panel">
      <h2 class="search-title">Explorar Eventos</h2>
      <div class="search-bar-wrapper">
        <pv-input-text
          v-model="query"
          @input="onSearchInput"
          placeholder="Buscar por título, categoría o dirección..."
          class="search-input"
        />
      </div>

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
        <p class="no-results-text">No se encontraron eventos para tu búsqueda.</p>
      </div>
    </div>

    <!-- Panel Derecho: Mapa de Google Maps -->
    <div class="map-panel">
      <div id="map-search" class="map-search-canvas"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import axios from "axios";
import EventCard from "@/modules/events/presentation/EventCard.vue";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/proxy" : "http://localhost:5000");
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA63CoEMd84d8bQBolX_gBrmksWBiev_vs";


const query = ref("");
const events = ref([]);
const filteredEvents = ref([]);

let map, geocoder;
let markers = [];
let activeInfoWindow = null;

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
    const res = await axios.get(`${API_URL}/api/events`);
    events.value = res.data.map(e => {
      // Normalizar la imagen miniatura del carrusel o fallback
      const image = e.photos && e.photos.length > 0 
        ? e.photos[0] 
        : 'https://via.placeholder.com/400x200?text=No+Image';

      return {
        ...e,
        image
      };
    });
    filteredEvents.value = [...events.value];
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

  // Pintar marcadores iniciales
  updateMapMarkers();
};

// Actualizar marcadores al filtrar eventos
const updateMapMarkers = () => {
  // Limpiar marcadores antiguos
  markers.forEach(m => m.setMap(null));
  markers = [];

  if (activeInfoWindow) activeInfoWindow.close();

  filteredEvents.value.forEach(ev => {
    const locData = parseLocation(ev.location);

    if (locData.lat && locData.lng) {
      createMarker(ev, { lat: locData.lat, lng: locData.lng });
    } else if (locData.address || ev.address) {
      // Geocodificar al vuelo de forma transparente si no tiene coordenadas
      const addr = locData.address || ev.address;
      geocoder.geocode({ address: addr }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          const loc = results[0].geometry.location;
          createMarker(ev, loc);
        }
      });
    }
  });
};

// Crear un marcador con InfoWindow
const createMarker = (ev, position) => {
  const marker = new google.maps.Marker({
    position,
    map,
    title: ev.title,
    animation: google.maps.Animation.DROP
  });

  marker.eventId = ev.id; // Asignar id de referencia

  const priceText = ev.price && ev.price > 0 ? `S/. ${ev.price}` : "Gratuito";
  const contentString = `
    <div style="font-family: Arial, sans-serif; max-width: 200px; padding: 5px;">
      <img src="${ev.image}" alt="${ev.title}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; margin-bottom: 8px;" />
      <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #333;">${ev.title}</h4>
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #666;">${ev.category || 'Sin categoría'}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
        <span style="font-weight: bold; font-size: 13px; color: #222;">${priceText}</span>
        <a href="/user/publishment/${ev.id}" style="background-color: #ffcd00; border: 1.5px solid #333; text-decoration: none; color: #333; font-weight: bold; padding: 4px 8px; font-size: 11px; border-radius: 2px;">Ver detalles</a>
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

// Filtro de búsqueda en tiempo real
const onSearchInput = () => {
  const q = query.value.toLowerCase().trim();
  if (!q) {
    filteredEvents.value = [...events.value];
  } else {
    filteredEvents.value = events.value.filter(e => {
      return (
        e.title.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.address && e.address.toLowerCase().includes(q))
      );
    });
  }
  updateMapMarkers();
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
  await loadEvents();
  loadGoogleMapsScript(() => {
    nextTick(() => {
      initSearchMap();
    });
  });
});
</script>

<style scoped>
.search-page-container {
  display: flex;
  height: calc(100vh - 80px); /* Ocupa la pantalla completa restando la barra de navegación */
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.list-panel {
  width: 40%;
  min-width: 380px;
  background-color: #fcfbfa;
  border-right: 2px solid #333;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.search-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #111;
}

.search-bar-wrapper {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  border: 2px solid #333;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
  padding: 0.75rem;
  box-sizing: border-box;
  font-size: 0.95rem;
}

.search-input:focus {
  border-color: #f59e0b;
  box-shadow: none;
}

.events-scroll-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Scrollbar retro minimalista */
.events-scroll-list::-webkit-scrollbar {
  width: 6px;
}
.events-scroll-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.events-scroll-list::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}
.events-scroll-list::-webkit-scrollbar-thumb:hover {
  background: #888;
}

.event-card-item {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  background: white;
  transition: all 0.2s ease;
}

.event-card-item:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 1);
}

.no-results-panel {
  text-align: center;
  padding: 2rem;
}

.no-results-text {
  color: #666;
  font-size: 1rem;
}

.map-panel {
  flex: 1;
  height: 100%;
  position: relative;
}

.map-search-canvas {
  width: 100%;
  height: 100%;
}

/* Responsivo para móviles */
@media (max-width: 850px) {
  .search-page-container {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  .list-panel {
    width: 100%;
    height: 500px;
    border-right: none;
    border-bottom: 2px solid #333;
  }
  .map-panel {
    height: 400px;
  }
}
</style>
