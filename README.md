# 🎪 NextHappen - Frontend

Este repositorio contiene la aplicación cliente (Frontend) para la plataforma **NextHappen**, construida con **Vue.js 3** y empaquetada con **Vite**. 

El objetivo principal de esta aplicación es ofrecer un portal interactivo tanto para **compradores** (descubrimiento de eventos, compra de entradas) como para **organizadores y emprendedores** (creación de eventos, gestión de stands y analíticas).

---

## 🏗️ Arquitectura: Domain-Driven Design (DDD)

Para garantizar la máxima escalabilidad y alinear el código del lado del cliente con nuestra **arquitectura backend basada en microservicios**, el proyecto frontend ha sido reestructurado siguiendo los principios de **Screaming Architecture** y **Domain-Driven Design**.

En lugar de agrupar archivos por su tipo técnico (views, components, services), el código fuente está dividido por **Dominios de Negocio** (Módulos). Cada módulo front-end está diseñado para comunicarse fluidamente con su microservicio homólogo en el backend.

### 📂 Estructura de Directorios

```text
src/
├── app/                  # Configuración Global
│   ├── router/           # Enrutador principal unificado
│   ├── store/            # Configuración de Pinia global
│   ├── i18n/             # Internacionalización
│   └── main.js           # Punto de entrada de la aplicación Vue
│
├── shared/               # Cross-Cutting Concerns (Código Reutilizable)
│   ├── infrastructure/   # Configuraciones de Axios e interceptores HTTP
│   ├── presentation/     # Componentes visuales genéricos (Navbar, Headers)
│   ├── locales/          # Archivos de idiomas (en.json, es.json)
│   └── assets/           # Estilos CSS globales, imágenes y tipografías
│
└── modules/              # 📦 Módulos de Negocio (El Core del Proyecto)
    ├── iam/              # Identity & Access Management (Login, Registro, Perfil)
    ├── events/           # Búsqueda, listado, detalles de ferias y Favoritos
    ├── organizer/        # Herramientas del organizador (Dashboard, Creación)
    ├── tickets/          # Compra, escaneo y gestión de entradas
    ├── stands/           # Formulario de postulación y listado de stands
    ├── metrics/          # Analíticas y reportes para el dashboard
    └── notifications/    # Sistema de alertas y notificaciones
```

---

## 🛠️ Tecnologías Principales

- **Vue.js 3** (Composition API)
- **Vite** (Build Tool super rápida)
- **Pinia** (Gestión de estado escalable)
- **Vue Router 4** (Navegación)
- **PrimeVue & PrimeFlex** (Framework de componentes y utilidades CSS)
- **Axios** (Cliente HTTP para la comunicación con el API Gateway)

---

## ⚙️ Conexión con Backend (Próximamente Microservicios)

Actualmente, el proyecto configura sus URLs base a través de variables de entorno. Próximamente, el sistema se conectará a un **API Gateway** centralizado, el cual enrutará las peticiones a los distintos microservicios (`iam-service`, `event-service`, `ticket-service`, etc.).

Es indispensable contar con tus archivos de entorno (`.env`):

**`.env.development`** (Uso local)
```env
VITE_API_URL=http://localhost:5000/api
```

**`.env.production`** (Despliegue)
```env
VITE_API_URL=https://tu-api-gateway.com/api
```

---

## 🚀 Guía de Instalación y Ejecución

1. Clona este repositorio.
2. Asegúrate de tener **Node.js** instalado (se recomienda la versión LTS).
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
5. Para compilar para producción:
   ```bash
   npm run build
   ```

---

## 🌱 Metodología de Trabajo y Commits

Este proyecto sigue el flujo de trabajo **Git Flow** y la convención de **Conventional Commits** para mantener un historial trazable e impecable.

### Ramas Principales
- `main` 🔒: Refleja el estado en producción. **No comitear directamente aquí.**
- `develop` 🛠️: Rama principal de integración. De aquí nacen todas las nuevas features.

### Creación de Nuevas Funcionalidades
1. Cambia a `develop` y sincronízate: `git checkout develop && git pull origin develop`
2. Crea tu rama: `git checkout -b feature/nombre-de-tu-tarea`
3. Al terminar, usa Conventional Commits. Ejemplos válidos:
   - `feat(events): añadir filtro por fecha`
   - `fix(iam): corregir bug en almacenamiento de token`
   - `refactor(stands): optimizar lista de expositores`
4. Sube tu rama y crea un Pull Request hacia `develop`.
