<template>
  <div class="my-fairs-page">
    <h2 class="page-title">{{ $t('myFairs.title') }}</h2>

    <div class="table-container">
      <DataTable :value="fairs" class="custom-table" responsiveLayout="scroll">
        <!-- Imagen -->
        <Column :header="$t('myFairs.columns.image')" style="width: 120px">
          <template #body="{ data }">
            <img
              v-if="data.photos && data.photos.length"
              :src="data.photos[0]"
              alt="Evento"
              class="event-thumb"
            />
            <div v-else class="no-image">{{ $t('myFairs.noImage') }}</div>
          </template>
        </Column>

        <!-- Columnas -->
        <Column field="organizer" :header="$t('myFairs.columns.org')">
          <template #body="{ data }">
            <span>{{ displayOrganizer(data.organizer) }}</span>
          </template>
        </Column>
        <Column field="title" :header="$t('myFairs.columns.name')" />
        <Column field="price" :header="$t('myFairs.columns.price')" />
        <Column field="quantity" :header="$t('myFairs.columns.quantity')" />
        <Column field="category" :header="$t('myFairs.columns.category')">
          <template #body="{ data }">
            <span>{{ data.category.name || data.category }}</span>
          </template>
        </Column>
        <Column :header="$t('myFairs.columns.date')">  
          <template #body="{ data }">  
            <span>{{ formatDateRange(data.dates) }}</span>  
          </template>
        </Column>
        <Column field="location" :header="$t('myFairs.columns.location')" />

        <!-- Acciones -->
        <Column :header="$t('myFairs.columns.actions')">
          <template #body="{ data }">
            <div class="actions-container">

              <Button
                :label="$t('myFairs.edit')"
                class="edit-btn"
                @click="editFair(data)"
              />
  
              <Button
                :label="$t('myFairs.delete')"
                class="delete-btn"
                @click="deleteFair(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Diálogo de edición -->
    <pv-dialog
      v-model:visible="showEditDialog"
      modal
      :draggable="false"
      :dismissableMask="false"
      class="dialog-custom"
    >
      <h3>{{ $t('myFairs.editDialog.title') }}</h3>
      
      <!-- Campos editables -->
      <div class="edit-form">
        <div class="org-name-container">
          <div class="field">
            <label>{{ $t('myFairs.columns.name') }}</label>
            <div class="edit-title">
              <pv-input-text v-model="selectedFair.title" />
            </div>
          </div>
        </div>
        
        <label>{{ $t('createEvent.fields.description') }}</label>
        <div class="edit-description">
          <pv-textarea v-model="selectedFair.description" rows="3" />
        </div>

        <div class="price-quantity-category-container">
          <div class="field">
            <label>{{ $t('myFairs.columns.price') }}</label>
            <div class="edit-price">
              <pv-input-number
                v-model="selectedFair.price"
                mode="currency"
                currency="PEN"
                locale="en-US"
              />
            </div>
          </div>
          
          <div class="field">
            <label>{{ $t('myFairs.columns.quantity') }}</label>
            <div class="edit-quantity">
              <pv-input-number v-model="selectedFair.quantity" />            
            </div>
          </div>
          
          <div class="field">
            <label>{{ $t('myFairs.columns.category') }}</label>
            <div class="edit-cascade">
              <pv-dropdown  
                v-model="selectedFair.category"
                :options="categories"
                optionLabel="name"
                optionValue="name"
                placeholder="Selecciona una categoría"
                class="category-select"
              />
            </div>
          </div>
        </div>
        
        <!-- Subir fotos -->
<div class="field">
  <label>{{ $t('createEvent.fields.photos') }}</label>
  <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
    <i class="pi pi-images upload-icon"></i>
    <p>{{ $t('createEvent.fields.dragText') }}</p>

    <input
      type="file"
      accept="image/*"
      multiple
      @change="onFileChange"
      ref="fileInput"
      class="hidden-input"
    />

    <pv-button
      :label="$t('createEvent.buttons.selectPhotos')"
      icon="pi pi-upload"
      class="upload-button"
      @click="$refs.fileInput.click()"
    />
  </div>

  <div v-if="previewImages.length" class="preview-container">
    <div
      v-for="(img, index) in previewImages"
      :key="index"
      class="image-preview"
    >
      <img :src="img" alt="Preview" />
      <pv-button class="remove-btn" @click="removeImage(index)">
        <i class="pi pi-times"></i>
      </pv-button>
    </div>
  </div>
</div>


        <label>{{ $t('myFairs.columns.date') }}</label>
        <div class="edit-date" style="display: flex; gap: 8px; margin-bottom: 12px;">
          <div style="flex: 1;">
            <span style="font-size: 0.8rem; color: #666; display: block; margin-bottom: 4px;">{{ $t('myFairs.startDate') }}</span>
            <pv-calendar
              v-model="selectedFair.startDateObj"
              dateFormat="dd/mm/yy"
              placeholder="Inicio"
              style="width: 100%;"
            />
          </div>
          <div style="flex: 1;">
            <span style="font-size: 0.8rem; color: #666; display: block; margin-bottom: 4px;">{{ $t('myFairs.endDate') }}</span>
            <pv-calendar
              v-model="selectedFair.endDateObj"
              dateFormat="dd/mm/yy"
              placeholder="Fin"
              style="width: 100%;"
            />
          </div>
        </div>

        <label>{{ $t('myFairs.columns.location') }}</label>
        <div class="edit-location" style="display: flex; gap: 8px; margin-bottom: 8px;">
          <pv-input-text v-model="selectedFair.address" placeholder="Ej: Av. Javier Prado 123" style="flex: 1;" />
          <pv-button icon="pi pi-search" class="p-button-warning" @click="searchEditAddress" />
        </div>

        <div class="field" style="margin-bottom: 12px;">
          <div id="map-edit" style="height: 250px; border: 2px solid #333; margin-bottom: 8px; background: #eee;"></div>
          <small v-if="selectedFair.location" style="display: block; font-weight: bold;">
            📍 {{ selectedFair.location }}
          </small>
        </div>
      </div>


      <template #footer>

        <pv-button
          label="Save"
          icon="pi pi-check"
          class="dialog-ok"
          @click="saveEdit"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

import { useToast } from "primevue/usetoast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";

const toast = useToast();

/* ============================================
   API BACKEND (.NET)
=============================================== */
const API_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/proxy" : "http://localhost:5000")}/api/events`;

const displayOrganizer = (org) => {
  const currentOrganizerId = localStorage.getItem("userId");
  const currentOrganizerName = localStorage.getItem("userName");
  if (org === currentOrganizerId && currentOrganizerName) {
    return currentOrganizerName;
  }
  return org || "";
};


/* ============================================
   STATES
=============================================== */
const fairs = ref([]);
const showEditDialog = ref(false);
const selectedFair = ref({});
const previewImages = ref([]);

/* =====================================================
   Categorías
===================================================== */
const categories = ref([
  { name: "Gastronomía" },
  { name: "Cultural" },
  { name: "Tecnología" },
  { name: "Arte y Diseño" },
  { name: "Moda y Belleza" },
  { name: "Música y Conciertos" },
  { name: "Deportes y Aventura" },
  { name: "Emprendimiento" },
  { name: "Educación y Capacitación" },
  { name: "Salud y Bienestar" },
  { name: "Medio Ambiente" },
  { name: "Gaming y Esports" },
  { name: "Fotografía y Cine" },
  { name: "Ciencia e Innovación" },
  { name: "Literatura" },
  { name: "Mascotas" },
  { name: "Viajes y Turismo" },
  { name: "Autos y Motos" },
  { name: "Infantil y Familiar" },
  { name: "Networking y Negocios" },
]);

/* ============================================
   LOAD EVENTS  (GET)
=============================================== */
const loadFairs = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al cargar eventos.");

    const data = await res.json();

    const currentOrganizerId = localStorage.getItem("userId");
    const currentOrganizerName = localStorage.getItem("userName");
    fairs.value = data
      .filter(ev => 
        ev.organizer === currentOrganizerId || 
        ev.organizer === currentOrganizerName || 
        !ev.organizer || 
        ev.organizer === ""
      )

      .map(ev => ({
        ...ev,
        dates: ev.startDate && ev.endDate
          ? [new Date(ev.startDate), new Date(ev.endDate)]
          : ev.dateRange?.startDate && ev.dateRange?.endDate
            ? [new Date(ev.dateRange.startDate), new Date(ev.dateRange.endDate)]
            : []
      }));



  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los eventos.",
      life: 2500,
    });
  }
};

onMounted(loadFairs);

/* =====================================================
   Google Maps - Edición
 ===================================================== */
let mapEdit, markerEdit, geocoderEdit;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA63CoEMd84d8bQBolX_gBrmksWBiev_vs";


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

const setupMarkerEditListeners = () => {
  if (!markerEdit) return;
  markerEdit.addListener("dragend", () => {
    const pos = markerEdit.getPosition();
    selectedFair.value.lat = pos.lat();
    selectedFair.value.lng = pos.lng();
    geocoderEdit.geocode({ location: pos }, (revResults, revStatus) => {
      if (revStatus === "OK" && revResults.length > 0) {
        selectedFair.value.location = revResults[0].formatted_address;
        selectedFair.value.address = revResults[0].formatted_address;
      }
    });
  });
};

const initEditMap = () => {
  const element = document.getElementById("map-edit");
  if (!element) return;

  geocoderEdit = new google.maps.Geocoder();

  let center = { lat: -12.0464, lng: -77.0428 };
  let zoom = 11;

  if (selectedFair.value.lat && selectedFair.value.lng) {
    center = { lat: selectedFair.value.lat, lng: selectedFair.value.lng };
    zoom = 16;
  }

  mapEdit = new google.maps.Map(element, {
    center: center,
    zoom: zoom
  });

  if (selectedFair.value.lat && selectedFair.value.lng) {
    markerEdit = new google.maps.Marker({
      position: center,
      map: mapEdit,
      draggable: true
    });
    setupMarkerEditListeners();
  } else if (selectedFair.value.address) {
    geocoderEdit.geocode({ address: selectedFair.value.address }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const loc = results[0].geometry.location;
        mapEdit.setCenter(loc);
        mapEdit.setZoom(16);
        markerEdit = new google.maps.Marker({
          position: loc,
          map: mapEdit,
          draggable: true
        });
        selectedFair.value.lat = loc.lat();
        selectedFair.value.lng = loc.lng();
        setupMarkerEditListeners();
      }
    });
  }

  mapEdit.addListener("click", (e) => {
    const pos = e.latLng;
    mapEdit.panTo(pos);
    if (markerEdit) markerEdit.setMap(null);
    markerEdit = new google.maps.Marker({
      position: pos,
      map: mapEdit,
      draggable: true
    });
    selectedFair.value.lat = pos.lat();
    selectedFair.value.lng = pos.lng();

    geocoderEdit.geocode({ location: pos }, (revResults, revStatus) => {
      if (revStatus === "OK" && revResults.length > 0) {
        selectedFair.value.location = revResults[0].formatted_address;
        selectedFair.value.address = revResults[0].formatted_address;
      }
    });

    setupMarkerEditListeners();
  });
};

const searchEditAddress = () => {
  if (!selectedFair.value.address || !geocoderEdit) return;
  geocoderEdit.geocode({ address: selectedFair.value.address }, (results, status) => {
    if (status === "OK" && results.length > 0) {
      const loc = results[0].geometry.location;
      mapEdit.setCenter(loc);
      mapEdit.setZoom(17);
      if (markerEdit) markerEdit.setMap(null);
      markerEdit = new google.maps.Marker({
        position: loc,
        map: mapEdit,
        draggable: true
      });
      selectedFair.value.lat = loc.lat();
      selectedFair.value.lng = loc.lng();
      selectedFair.value.location = results[0].formatted_address;
      setupMarkerEditListeners();
    } else {
      toast.add({
        severity: "warn",
        summary: "No encontrada",
        detail: "No se pudo geolocalizar la dirección.",
        life: 2500
      });
    }
  });
};

/* ============================================
   OPEN EDIT MODAL — FIXED
 =============================================== */
const editFair = (fair) => {
  const locData = parseLocation(fair.location);

  selectedFair.value = {
    ...fair,
    lat: locData.lat,
    lng: locData.lng,
    address: locData.address || fair.address || fair.location,
    location: locData.address || fair.location,
    startDateObj: fair.dateRange?.startDate ? new Date(fair.dateRange.startDate) : new Date(),
    endDateObj: fair.dateRange?.endDate ? new Date(fair.dateRange.endDate) : new Date()
  };


  previewImages.value = [...(selectedFair.value.photos || [])];
  showEditDialog.value = true;

  loadGoogleMapsScript(() => {
    nextTick(() => {
      initEditMap();
    });
  });
};


/* ============================================
   IMAGE HANDLING
=============================================== */
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dmdswrhah/image/upload";
const UPLOAD_PRESET = "nexthappen_unsigned";

const onFileChange = async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // URL FINAL (esto es lo que guardas en la BD)
    const imageUrl = data.secure_url;

    previewImages.value.push(imageUrl);

    if (!selectedFair.value.photos) selectedFair.value.photos = [];
    selectedFair.value.photos.push(imageUrl);
  }
};

const handleDrop = async (e) => {
  const files = Array.from(e.dataTransfer.files);

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const imageUrl = data.secure_url;

    previewImages.value.push(imageUrl);

    if (!selectedFair.value.photos) selectedFair.value.photos = [];
    selectedFair.value.photos.push(imageUrl);
  }
};


const removeImage = (index) => {
  previewImages.value.splice(index, 1);
  selectedFair.value.photos.splice(index, 1);
};

/* ============================================
   SAVE EDIT (PUT) — FIXED
=============================================== */
const saveEdit = async () => {
  try {
    const fair = { ...selectedFair.value };

    if (!fair.startDateObj || !fair.endDateObj) {
      toast.add({
        severity: "error",
        summary: "Fechas requeridas",
        detail: "Debes seleccionar fecha de inicio y fin.",
        life: 2500,
      });
      return;
    }

    fair.startDate = fair.startDateObj.toISOString();
    fair.endDate = fair.endDateObj.toISOString();
    delete fair.startDateObj;
    delete fair.endDateObj;
    delete fair.dates;

    // Formatear la ubicación georreferenciada antes de guardar
    const lat = fair.lat;
    const lng = fair.lng;
    const address = fair.address;
    if (lat && lng) {
      fair.location = `${lat},${lng}|${fair.location || address}`;
    } else {
      fair.location = fair.location || address;
    }

    // Eliminar temporales
    delete fair.lat;
    delete fair.lng;
    delete fair.address;

    const token = localStorage.getItem("token");
    console.log("[EventsModule] API_URL for PUT:", `${API_URL}/${fair.id}`);
    console.log("[EventsModule] Token for PUT:", token);
    const res = await fetch(`${API_URL}/${fair.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(fair),
    });



    if (!res.ok) throw new Error("No se pudo actualizar el evento.");

    toast.add({
      severity: "success",
      summary: "Actualizado",
      detail: "El evento fue actualizado exitosamente.",
      life: 2500,
    });

    showEditDialog.value = false;
    await loadFairs();

  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo guardar la edición.",
      life: 2500,
    });
  }
};

/* ============================================
   DELETE EVENT
=============================================== */
const deleteFair = async (fair) => {
  if (!window.confirm(`¿Eliminar el evento "${fair.title}"?`)) return;

  try {
    const token = localStorage.getItem("token");
    console.log("[EventsModule] API_URL for DELETE:", `${API_URL}/${fair.id}`);
    console.log("[EventsModule] Token for DELETE:", token);
    const res = await fetch(`${API_URL}/${fair.id}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`
      }
    });


    if (!res.ok && res.status !== 204)
      throw new Error("No se pudo eliminar.");

    toast.add({
      severity: "success",
      summary: "Eliminado",
      detail: "El evento fue eliminado.",
      life: 2000,
    });

    await loadFairs();

  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo eliminar el evento.",
      life: 2500,
    });
  }
};

/* ============================================
   FORMAT DATE RANGE
=============================================== */
const formatDateRange = (dates) => {
  if (!dates || !Array.isArray(dates) || dates.length < 2) return "";
  const d1 = dates[0];
  const d2 = dates[1];
  if (!d1 || !d2) return "";
  const date1 = d1 instanceof Date ? d1 : new Date(d1);
  const date2 = d2 instanceof Date ? d2 : new Date(d2);
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return "";
  return `${date1.toLocaleDateString()} - ${date2.toLocaleDateString()}`;
};

</script>

<style scoped>
.my-fairs-page {
  max-width: 80rem;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #1d1d1d;
}

.custom-table {
  border: 2px solid #333;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.status-badge {
  color: #1d1d1d;
  padding: 0.35rem 0.9rem;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.date-text {
  font-size: 0.95rem;
}

.location-text {
  text-decoration: none;
}

.edit-btn {
  border: 2px solid #333;
  height: 38px;
  background-color: #ffcd00;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-weight: bold;
}

.edit-btn:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.delete-btn {
  border: 2px solid #333;
  height: 38px;
  background-color: #d32f2f;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-weight: bold;
}

.delete-btn:hover {
  background-color: #fff7ed;
  color: #d32f2f;
  border-color: #d32f2f;
  cursor: pointer;
  box-shadow: none;
}

.actions-container {
  display: flex;
  gap: 0.5rem;
}


.event-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}
.no-image {
  font-size: 0.8rem;
  color: #999;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-style: italic;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.dialog-custom {
  border: 2px solid #333 !important;
  background-color: #fff7ed !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  padding: 3rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1rem;
}

.preview-container {
  margin-top: 0.5rem;
}

.image-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.hidden-input {
  display: none;
}

.dialog-ok {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  background-color: #ffcd00;
  font-weight: bold;
}

.dialog-ok:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow: none;
  cursor: pointer;
}

.dialog-cancel {
  border: 2px solid #333;
  background-color: #d32f2f;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  color: white;
  font-weight: bold;
  margin-right: 1rem;
}

.dialog-cancel:hover {
  background-color: #fff7ed;
  color: #d32f2f;
  border-color: #d32f2f;
  box-shadow: none;
  cursor: pointer;
}

.org-name-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.org-name-container .field {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.price-quantity-category-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

/*cada subtitulo arriba del field*/ 
.price-quantity-category-container .field {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.upload-area {
  border: 2px dashed #ccc;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
  background-color: #fafafa;
  font-size: 15px;
  
}

.upload-area:hover {
  border-color: #fac738;
  background-color: #fff8e1;
}

.upload-icon {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.upload-button {
  border: 2px solid #333;
  height: 20px;
  font-weight: bold;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  background-color: #ffcd00;
  margin-top: 0.5rem;
}

.upload-button:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.hidden-input {
  display: none;
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.image-preview {
  position: relative;
  width: 60px;
  height: 60px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}


:deep(.edit-cascade .p-dropdown){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 22px !important;
  position: relative !important;
}

:deep(.edit-org .p-inputtext){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
}

:deep(.edit-title .p-inputtext){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
}

:deep(.edit-description .p-inputtext){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
  font-family: 'Inter', sans-serif;
}

:deep(.edit-price .p-inputnumber-input){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
}

:deep(.edit-quantity .p-inputnumber-input){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
}

:deep(.edit-date .p-inputtext){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
} 

:deep(.edit-location .p-inputtext){
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff !important;
  height: 20px !important;
  position: relative !important;
} 

</style>