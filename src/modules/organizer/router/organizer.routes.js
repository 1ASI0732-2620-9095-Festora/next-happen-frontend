// --- Rutas de Organizer / Emprendedor ---
import Home from '@/modules/events/presentation/Home.vue'
import Entrepreneur from '@/modules/metrics/presentation/entrepreneur-metrics.vue'
// --- Lazy load de Organizer Pages ---
const CreateEvent = () => import('@/modules/organizer/presentation/create-event.vue')
const Events = () => import('@/modules/organizer/presentation/events.vue')
const StandsList = () => import('@/modules/stands/presentation/stands-list.vue')
const StandForm = () => import('@/modules/stands/presentation/stand-form.vue')
const Notifications = () => import('@/modules/notifications/presentation/Notifications.vue')
const Profile = () => import('@/modules/iam/presentation/Profile.vue')
const SalesDashboard = () => import('@/modules/metrics/presentation/sales-dashboard.vue')
const ValidateTickets = () => import('@/modules/tickets/presentation/ValidateTickets.vue')
const Dashboard = () => import('@/modules/organizer/presentation/dashboard.vue')

export default [
    { path: '/org/entrepreneur', name: 'org-entrepreneur', component: Entrepreneur, meta: { requiresAuth: true, role: "Organizer" } },
    { path: '/org/register-stands/:eventId?', name: 'org-register-stands', component: StandsList, meta: { requiresAuth: true, role: "Organizer" } },
    { path: '/org/register-stands/:eventId/new', name: 'org-stand-new', component: StandForm, meta: { requiresAuth: true, role: "Organizer" } },
    { path: '/org/register-stands/:eventId/:id/edit', name: 'org-stand-edit', component: StandForm, meta: { requiresAuth: true, role: "Organizer" } },

    { path: '/org/dashboard', name: 'org-dashboard', component: Dashboard, meta: { requiresAuth: true, role: "Organizer" }},
    { path: '/org/create-event', name: 'org-create-event', component: CreateEvent, meta: { requiresAuth: true, role: "Organizer" }},
    { path: '/org/events', name: 'org-events', component: Events, meta: { requiresAuth: true, role: "Organizer" }},
    { path: '/org/sales', name: 'org-sales', component: SalesDashboard, meta: { requiresAuth: true, role: "Organizer" }},
    { path: '/org/validate', name: 'org-validate', component: ValidateTickets, meta: { requiresAuth: true, role: "Organizer" }},
    { path: '/org/notifications', name: 'org-notifications', component: Notifications, meta: { requiresAuth: true, role: "Organizer" }},
    { path: '/org/profile', name: 'org-profile', component: Profile, meta: { requiresAuth: true, role: "Organizer" }},
]

