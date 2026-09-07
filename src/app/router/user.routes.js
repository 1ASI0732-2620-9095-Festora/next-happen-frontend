import { createRouter, createWebHistory } from 'vue-router'

// Importación directa de vistas
import Home from '@/modules/events/presentation/Home.vue'
import Events from '@/modules/events/presentation/Events.vue'
import Search from '@/modules/events/presentation/Search.vue'
import SignUps from '@/modules/iam/presentation/SignUps.vue'
import Publishment from '@/modules/events/presentation/Publishment.vue'
import Tickets from '@/modules/tickets/presentation/Tickets.vue'
import CheckoutSuccess from '@/modules/tickets/presentation/CheckoutSuccess.vue'
import CheckoutCancel from '@/modules/tickets/presentation/CheckoutCancel.vue'
import SignIn from '@/modules/iam/presentation/SignIn.vue'
import Profile from '@/modules/iam/presentation/Profile.vue'

const routes = [
    { path: '/', redirect: '/signin' },

    { path: '/user/home', name: 'user-home', component: Home, meta: { requiresAuth: true, role: "User" } },
    { path: '/user/events', name: 'user-events', component: Events, meta: { requiresAuth: true, role: "User" } },
    { path: '/user/tickets', name: 'user-tickets', component: Tickets, meta: { requiresAuth: true, role: "User" } },
    { path: '/user/checkout/success', name: 'user-checkout-success', component: CheckoutSuccess, meta: { requiresAuth: true, role: "User" } },
    { path: '/user/checkout/cancel', name: 'user-checkout-cancel', component: CheckoutCancel, meta: { requiresAuth: true, role: "User" } },
    { path: '/user/search', name: 'user-search', component: Search, meta: { requiresAuth: true, role: "User" } },
    { path: '/user/profile', name: 'user-profile', component: Profile, meta: { requiresAuth: true, role: "User" } },

    // Rutas abiertas
    { path: '/signup', name: 'user-signup', component: SignUps },
    { path: '/signin', name: 'user-signin', component: SignIn },
    { path: '/user/publishment/:id', name: 'user-publishment', component: Publishment, props: true },
]

export default routes

