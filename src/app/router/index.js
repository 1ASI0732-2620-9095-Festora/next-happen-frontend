import { createRouter, createWebHistory } from 'vue-router'
import userRoutes from '@/app/router/user.routes.js'
import organizerRoutes from '@/modules/organizer/router/organizer.routes.js'
import standsRoutes from '@/modules/stands/router/stands.routes.js'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...userRoutes,
        ...organizerRoutes,
        ...standsRoutes,
        { 
            path: '/', 
            redirect: () => {
                const role = localStorage.getItem("role");
                return role === "User" ? "/user/home" : "/org/create-event";
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role") // "User" o "Organizer"

    // Si la ruta necesita estar logueado y no hay token → redirect
    if (to.meta.requiresAuth && !token) {
        return next("/signin")
    }

    // Si eres USER y la ruta es de ORGANIZER → bloquear
    if (role === "User" && to.meta.role === "Organizer") {
        return next("/user/home")
    }

    // Si eres ORGANIZER puedes entrar a todo
    // No hace falta condición aquí

    next()
})

export default router

