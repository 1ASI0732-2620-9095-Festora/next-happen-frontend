<template>
  <div class="create-event-page">
    <h1 class="page-title">{{ $t('createEvent.titlePage') }}</h1>

    <div class="form-container">
      <!-- Nombre del organizador -->
      <div class="field">
        <label for="org">{{ $t('createEvent.fields.orgName') }}</label>
        <pv-input-text
          id="org"
          class="org-form"
          v-model="form.organizer"
          :placeholder="$t('createEvent.fields.orgPlaceholder')"
        />
      </div>

      <!-- Título -->
      <div class="field">
        <label for="title">{{ $t('createEvent.fields.title') }}</label>
        <pv-input-text
          id="title"
          class="title-form"
          v-model="form.title"
          :placeholder="$t('createEvent.fields.titlePlaceholder')"
        />
      </div>

      <!-- Descripción -->
      <div class="field">
        <label for="description">{{ $t('createEvent.fields.description') }}</label>
        <pv-textarea
          id="description"
          class="description-form"
          v-model="form.description"
          rows="4"
          :placeholder="$t('createEvent.fields.descriptionPlaceholder')"
          autoResize
        />
      </div>

      <!-- Precio / Cantidad / Categoría -->
      <div class="field">
        <div class="price-quantity-category">
          <!-- Precio -->
          <div class="input-group">
            <label for="price">{{ $t('createEvent.fields.price') }}</label>
            <pv-input-number
              id="price"
              v-model="form.price"
              :placeholder="$t('createEvent.fields.pricePlaceholder')"
              inputId="price_input"
              mode="currency"
              currency="PEN"
              locale="en-US"
              variant="filled"
            />
          </div>

          <!-- Cantidad -->
          <div class="input-group">
            <label for="quantity">{{ $t('createEvent.fields.quantity') }}</label>
            <pv-input-number
              id="quantity"
              v-model="form.quantity"
              :placeholder="$t('createEvent.fields.quantityPlaceholder')"
            />
          </div>

          <!-- Categoría -->
          <div class="input-group">
            <label for="category">{{ $t('createEvent.fields.category') }}</label>
            <pv-cascade-select
              id="category"
              v-model="form.category"
              :options="categories"
              optionLabel="name"
              optionGroupLabel="name"
              optionGroupChildren="subcategories"
              placeholder="Selecciona una categoría"
              class="category-select no-hover"
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

      <!-- Dirección -->
      <div class="field">
        <label for="address">{{ $t('createEvent.fields.address') }}</label>
        <div class="address-search">
          <pv-input-text
            id="address"
            class="address-form"
            v-model="form.address"
            :placeholder="$t('createEvent.fields.addressPlaceholder')"
          />
          <pv-button
            icon="pi pi-search"
            :label="$t('createEvent.buttons.search')"
            class="search-button"
            @click="searchAddress"
          />
        </div>
      </div>

      <!-- Mapa (Geolocalizado) -->
      <div class="field">
        <label>{{ $t('createEvent.fields.location') }}</label>
        <div id="map" class="map"></div>
        <small v-if="form.location">
          {{ $t('createEvent.mapMarker') }} {{ form.location }}
        </small>
      </div>


      <!-- Fechas -->
      <div class="field">
        <label>{{ $t('createEvent.fields.dates') }}</label>
        <pv-calendar
          v-model="form.dates"
          selectionMode="range"
          dateFormat="dd/mm/yy"
          :placeholder="$t('createEvent.fields.dates')"
          class="calendar-custom"
        />
      </div>

      <!-- Botón Publicar -->
      <div class="button-container">
        <pv-button
          :label="$t('createEvent.buttons.publish')"
          icon="pi pi-check"
          class="publish-button"
          @click="publishEvent"
        />
      </div>
    </div>
    
    <!--Diálogo de éxito -->
    <pv-dialog
      v-model:visible="showSuccessDialog"
      modal
      :draggable="false"
      :closable="false"
      :dismissableMask="false"
      class="dialog-custom"
    >
      <h3>{{ $t('createEvent.messages.successTitle') }}</h3>
      <p>{{ $t('createEvent.messages.success') }}</p>

      <template #footer>
        <pv-button
          label="OK"
          icon="pi pi-check"
          @click="showSuccessDialog = false"
          class="dialog-ok"
        />
      </template>
    </pv-dialog>

    <!--Diálogo de error -->
    <pv-dialog
      v-model:visible="showErrorDialog"
      modal
      :draggable="false"
      :closable="false"
      :dismissableMask="false"
      class="dialog-custom"
    >
      <h3>{{ $t('createEvent.messages.errorTitle') }}</h3>
      <p>{{ $t('createEvent.messages.error') }}</p>
      <template #footer>
        <pv-button
          label="OK"
          icon="pi pi-times"
          @click="showErrorDialog = false"
          class="dialog-ok"
        />
      </template>
    </pv-dialog>

    <!-- Diálogo de campos faltantes -->
    <pv-dialog
      v-model:visible="showMissingFieldsDialog"
      modal
      :draggable="false"
      :closable="false"
      :dismissableMask="false"
      class="dialog-custom"
    >
      <h3>{{ $t('createEvent.messages.warningTitle') }}</h3>
      <p>{{ $t('createEvent.messages.missingFields') }}</p>
      <template #footer>
        <pv-button
          label="OK"
          icon="pi pi-exclamation-triangle"
          @click="showMissingFieldsDialog = false"
          class="dialog-ok"
        />
      </template>
    </pv-dialog>

    <pv-dialog
      v-model:visible="showAddressDialog"
      modal
      :draggable="false"
      :closable="false"
      :dismissableMask="false"
      class="dialog-custom"
    >
      <h3>{{ $t('createEvent.messages.addressErrorTitle') }}</h3>
      <p>{{ $t('createEvent.messages.addressNotFound') }}</p>
      <template #footer>
        <pv-button
          label="OK"
          icon="pi pi-map-marker"
          @click="showAddressDialog = false"
          class="dialog-ok"
        />
      </template>
    </pv-dialog>
  </div>
</template>


<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// URL del backend .NET (Render)
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/proxy" : "http://localhost:5000");


/* =====================================================
   Formulario
===================================================== */
const form = ref({
  organizer: "",
  title: "",
  description: "",
  price: null,
  quantity: null,
  category: "",
  photos: [],
  address: "",
  location: "",
  dates: null,
  lat: null,
  lng: null,
});

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

/* =====================================================
   Estados
===================================================== */
const previewImages = ref([]);
const fileInput = ref(null);
const showSuccessDialog = ref(false);
const showErrorDialog = ref(false);
const showMissingFieldsDialog = ref(false);
const showAddressDialog = ref(false);

/* =====================================================
   Google Maps
===================================================== */
let map, marker, geocoder;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA63CoEMd84d8bQBolX_gBrmksWBiev_vs";



/* =====================================================
   CLOUDINARY CONFIG
===================================================== */
const CLOUDINARY_UPLOAD_PRESET = "nexthappen_unsigned";   // cambia por tu preset real
const CLOUDINARY_CLOUD_NAME = "dmdswrhah";              // cambia por tu cloud name real

/* =====================================================
   SUBIR IMAGEN A CLOUDINARY
===================================================== */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.secure_url; // 🔥 URL final optimizada
};

/* =====================================================
   Manejo de imágenes
===================================================== */
const onFileChange = async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    const imageUrl = await uploadToCloudinary(file);
    previewImages.value.push(imageUrl);
    form.value.photos.push(imageUrl);
  }
};

const handleDrop = async (e) => {
  const files = Array.from(e.dataTransfer.files);

  for (const file of files) {
    const imageUrl = await uploadToCloudinary(file);
    previewImages.value.push(imageUrl);
    form.value.photos.push(imageUrl);
  }
};

const removeImage = (index) => {
  previewImages.value.splice(index, 1);
  form.value.photos.splice(index, 1);
};

/* =====================================================
   Publicar evento en Backend .NET
===================================================== */
const publishEvent = async () => {
  if (!form.value.title || !form.value.dates || !form.value.address) {
    showMissingFieldsDialog.value = true;
    return;
  }

  const [start, end] = Array.isArray(form.value.dates)
    ? form.value.dates
    : [form.value.dates, form.value.dates];

  const lat = form.value.lat;
  const lng = form.value.lng;
  const rawAddress = form.value.address;
  const locationString = lat && lng ? `${lat},${lng}|${form.value.location || rawAddress}` : (form.value.location || rawAddress);

  const newEvent = {
    organizer: form.value.organizer,
    title: form.value.title,
    description: form.value.description,
    price: parseFloat(form.value.price) || null,
    quantity: parseInt(form.value.quantity) || null,
    category: form.value.category?.name || "",
    address: rawAddress,
    location: locationString,
    photos: form.value.photos,
    startDate: new Date(start).toISOString(),
    endDate: new Date(end).toISOString(),
    isPublic: true 
  };


  try {
    const token = localStorage.getItem("token");
    console.log("[CreateEvent] API_URL:", API_URL);
    console.log("[CreateEvent] Token in localStorage:", token);
    const res = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newEvent),
    });

    if (!res.ok) throw new Error("No se pudo crear el evento");

    showSuccessDialog.value = true;

    form.value = {
      organizer: "",
      title: "",
      description: "",
      price: null,
      quantity: null,
      category: "",
      photos: [],
      address: "",
      location: "",
      dates: null,
      lat: null,
      lng: null,
    };

    previewImages.value = [];
  } catch (error) {
    console.error("Error al publicar evento:", error);
    showErrorDialog.value = true;
  }
};

/* =====================================================
   Buscar dirección con Google Maps
===================================================== */
const searchAddress = () => {
  if (!form.value.address) {
    showMissingFieldsDialog.value = true;
    return;
  }

  geocoder.geocode({ address: form.value.address }, (results, status) => {
    if (status === "OK" && results.length > 0) {
      const result = results[0];
      const location = result.geometry.location;

      map.setCenter(location);
      map.setZoom(17);

      if (marker) marker.setMap(null);

      marker = new google.maps.Marker({
        position: location,
        map,
        draggable: true,
      });

      form.value.lat = location.lat();
      form.value.lng = location.lng();
      form.value.location = result.formatted_address;

      // Evento al arrastrar marcador
      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        form.value.lat = pos.lat();
        form.value.lng = pos.lng();
        geocoder.geocode({ location: pos }, (revResults, revStatus) => {
          if (revStatus === "OK" && revResults.length > 0) {
            form.value.location = revResults[0].formatted_address;
            form.value.address = revResults[0].formatted_address;
          }
        });
      });
    } else {
      showAddressDialog.value = true;
    }
  });
};

/* =====================================================
   Inicializar mapa
===================================================== */
const initMap = () => {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -12.0464, lng: -77.0428 },
    zoom: 12,
  });

  // Habilitar clic en el mapa para colocar el marcador directamente
  map.addListener("click", (e) => {
    const pos = e.latLng;
    map.panTo(pos);

    if (marker) marker.setMap(null);

    marker = new google.maps.Marker({
      position: pos,
      map,
      draggable: true,
    });

    form.value.lat = pos.lat();
    form.value.lng = pos.lng();

    geocoder.geocode({ location: pos }, (revResults, revStatus) => {
      if (revStatus === "OK" && revResults.length > 0) {
        form.value.location = revResults[0].formatted_address;
        form.value.address = revResults[0].formatted_address;
      }
    });

    // Registrar dragend al recrear marcador
    marker.addListener("dragend", () => {
      const dragPos = marker.getPosition();
      form.value.lat = dragPos.lat();
      form.value.lng = dragPos.lng();
      geocoder.geocode({ location: dragPos }, (revResults, revStatus) => {
        if (revStatus === "OK" && revResults.length > 0) {
          form.value.location = revResults[0].formatted_address;
          form.value.address = revResults[0].formatted_address;
        }
      });
    });
  });
};

onMounted(() => {
  const currentOrganizer = localStorage.getItem("userName") || localStorage.getItem("userId") || "Organizer";
  form.value.organizer = currentOrganizer;

  nextTick(() => {
    if (!window.google?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  });
});

</script>


<style scoped>
.create-event-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
}

.form-container{
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

.org-form {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  height: 30px;
  font-size: 0.95rem;
}

.title-form{
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  height: 30px;
  font-size: 0.95rem;
}

.price-quantity-form{
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  height: 30px;
  font-size: 0.95rem;
}

.description-form{
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-family: sans-serif;
  font-size: 0.95rem;
}

.address-search {
  display: flex;
  gap: 0.5rem;
}

.address-form{
  flex: 1;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  height: 30px;
  font-size: 0.95rem;
}

.search-button{
  border: 2px solid #333;
  height: 38px;
  background-color: #ffcd00;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  font-weight: bold;
}

.search-button:hover{
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

#map {
  height: 350px;
  width: 100%;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
}

.upload-area {
  border: 2px dashed #ccc;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #fac738;
  background-color: #fff8e1;
}

.upload-icon {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.upload-button {
  border: 2px solid #333;
  height: 40px;
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
  width: 120px;
  height: 120px;
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

.remove-btn:hover {
  background-color: #ccc;
}

.remove-btn i {
  color: #d32f2f;
  font-size: 0.9rem;
}

:deep(.p-calendar) {
  width: 100%;
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  background-color: #fff;
  height: 38px;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

:deep(.p-calendar .p-inputtext) {
  border: none !important;
  box-shadow: none !important;
  width: 100%;
  height: 100%;
  background: transparent !important;
  color: #111;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
}

:deep(.p-calendar .p-button) {
  border: none !important;
  background: transparent !important;
  color: #333 !important;
  transition: all 0.2s ease;
}

:deep(.p-calendar:hover),
:deep(.p-calendar:focus-within) {
  border-color: #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  outline: none !important;
}
.publish-button{
  border: 2px solid #333;
  height: 40px;
  font-size: 1rem;
  background-color: #ffcd00;
  font-weight: bold;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 20);
  cursor: pointer;
}

.publish-button:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.price-quantity-category {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.category-form {
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2) !important;
  height: 38px !important;
  font-size: 0.95rem !important;
}

.price-quantity-category .input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.dialog-ok {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  background-color: #ffcd00;
}

.dialog-ok:hover {
  background-color: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
  cursor: pointer;
  box-shadow: none;
}
</style>