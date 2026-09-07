import { createApp } from 'vue'
import App from '@/app/App.vue'
import router from '@/app/router/index.js'
import {i18n} from '@/app/i18n/i18n.js'
import pinia from '@/app/store/pinia.js'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material'

// estilos
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import '@/shared/assets/retro.css'
import '@/shared/assets/style.css'

// componentes
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Avatar from 'primevue/avatar'
import Menubar from 'primevue/menubar'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'

// servicios
import ToastService from 'primevue/toastservice'
import DialogService from 'primevue/dialogservice'
import ConfirmationService from 'primevue/confirmationservice'
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import CascadeSelect from "primevue/cascadeselect";
import MultiSelect from 'primevue/multiselect'

createApp(App)
    .use(PrimeVue, { ripple: true, theme: { preset: Material, options: { darkModeSelector: false } } })
    .use(router)
    .use(i18n)
    .use(pinia)
    .use(ToastService)
    .use(DialogService)
    .use(ConfirmationService)
    .component('pv-input-text', InputText)
    .component('pv-textarea', Textarea)
    .component('pv-calendar', DatePicker)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-data-table', DataTable)
    .component('pv-column', Column)
    .component('pv-dropdown', Select)
    .component('pv-avatar', Avatar)
    .component('pv-menubar', Menubar)
    .component('pv-toast', Toast)
    .component('pv-dialog', Dialog)
    .component('pv-input-number', InputNumber)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-cascade-select', CascadeSelect)
    .component('pv-multi-select', MultiSelect)
    .mount('#app')
