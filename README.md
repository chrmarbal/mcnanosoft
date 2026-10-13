# McnanoSoft

McnanoSoft es una plataforma para descubrir y gestionar proyectos de software. Los visitantes pueden explorar el catálogo, consultar detalles y valoraciones; los usuarios pueden comprar proyectos, descargarlos desde su biblioteca y gestionar su cuenta. Los administradores gestionan proyectos, usuarios y opiniones.

## Funcionalidades

- Catálogo de proyectos con búsqueda, filtros por tecnología, precio y tipo de licencia.
- Carrito de compra y checkout con Stripe.
- Biblioteca personal con descarga de proyectos.
- Valoraciones y opiniones moderadas por administración.
- Registro, inicio de sesión, recuperación de contraseña y OAuth con Google/GitHub.
- Herramientas de administración para proyectos y usuarios.
- Interfaz adaptable con skeleton loaders para navegación, catálogo, biblioteca y carrito.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite, React Router, Material UI, Bootstrap, Axios, GSAP |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Autenticación | JWT, sesiones de Express, Passport, OAuth Google/GitHub |
| Pagos y archivos | Stripe, Google Drive API, Multer, Sharp |
| Otros | Nodemailer, React Toastify, Font Awesome |

## Estructura

```text
Backend/
  controllers/   Lógica de API
  models/        Modelos MongoDB
  routes/        Rutas Express
  seeds/         Datos iniciales de desarrollo
  scripts/       Utilidades, incluidos certificados locales
  private/       Credenciales de servicios externos
Frontend/
  src/components/ Componentes agrupados por funcionalidad
  src/context/    Estado compartido de usuario, carrito y carga
  src/views/      Páginas de la aplicación
```

## Requisitos

- Node.js y npm.
- MongoDB accesible desde el backend.
- Claves de desarrollo de Stripe y credenciales OAuth de Google/GitHub; el backend inicializa estas estrategias al arrancar.
- Certificados HTTPS locales para Vite y el backend.
- Credenciales de correo y Google Drive para habilitar recuperación por email y gestión de archivos.

## Configuración

1. Instala las dependencias en cada aplicación:

```powershell
cd Backend
npm install
cd ..\Frontend
npm install
```

2. Crea `Backend/.env` y `Frontend/.env` a partir de esta lista de variables. No subas estos archivos ni incluyas credenciales reales en el repositorio.

`Backend/.env`:

```dotenv
PUERTO=3016
API_VERSION=v1
MONGODB_CONSTRING=mongodb://localhost:27017/mcnanosoft
SECRET_JWT=cambia-este-secreto
SESSION_SECRET=cambia-este-secreto
STRIPE_PRIVATE_API_KEY=sk_test_...

# Necesarias para inicializar las estrategias OAuth del backend
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://localhost:3016/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://localhost:3016/auth/github/callback

# Opcionales: recuperación por correo
EMAIL_USER=
GOOGLE_APP_PASSWORD=
```

`Frontend/.env`:

```dotenv
VITE_BASE_URL_BACKEND=https://localhost:3016/api/v1
```

El proyecto de Vite lee sus certificados desde `Frontend/certs/`; el backend los lee desde `Backend/certs/`. En Windows, el script incluido genera certificados de desarrollo con `mkcert` y Chocolatey:

```powershell
cd Backend
.\scripts\createCerts.ps1
```

El script instala herramientas en el equipo y puede requerir permisos de administrador. Si ya tienes `mkcert`, puedes generar los certificados manualmente en las carpetas `Backend/certs/` y `Frontend/certs/`, con los nombres `cert.crt` y `private.key`.

## Datos iniciales

Los seeds son para una base de datos de desarrollo vacía. Insertan registros y no son idempotentes; no los ejecutes repetidamente sobre una base con datos.
Las cuentas creadas por los seeds son de demostración; cambia sus credenciales antes de usar un entorno compartido.

Desde `Backend/`, ejecuta en este orden:

```powershell
node .\seeds\projects.seed.js
node .\seeds\users.seed.js
node .\seeds\purchases.seed.js
```

## Ejecutar en desarrollo

Inicia MongoDB y el backend en una terminal:

```powershell
cd Backend
node index.js
```

En otra terminal, inicia Vite:

```powershell
cd Frontend
npm run dev
```

Direcciones locales por defecto:

- Frontend: <https://localhost:5173>
- API: <https://localhost:3016/api/v1>

Para compilar el frontend para producción:

```powershell
cd Frontend
npm run build
```

Para ejecutar ESLint:

```powershell
cd Frontend
npm run lint
```

## Integraciones

- **Stripe:** configura claves de prueba mientras desarrollas. El servidor valida la sesión de Stripe antes de conceder una compra.
- **Google y GitHub OAuth:** configura los identificadores, secretos y URLs de callback en las consolas correspondientes; son necesarios para iniciar el backend tal como está implementado actualmente.
- **Google Drive:** el backend espera la clave de la cuenta de servicio en `Backend/private/mcnanosoft-6386bcc17091.json` para almacenar y descargar archivos. Mantén ese archivo fuera del control de versiones.
- **Correo:** la recuperación de cuenta requiere `EMAIL_USER` y `GOOGLE_APP_PASSWORD`.

No uses claves de producción ni datos personales reales en entornos locales o de prueba.