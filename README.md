# Sistema de Gestión de Inventario Pro 🚀

Aplicación web profesional diseñada para que pequeños y medianos negocios puedan gestionar su inventario, registrar ventas, controlar proveedores y generar reportes detallados. Construida con un stack moderno: **React 19** en el frontend y **FastAPI + PostgreSQL** en el backend.

---

## ✨ Características Principales (Nuevas y Actualizadas)

### 🔐 Seguridad y Gestión de Accesos
- **Autenticación Robusta:** Registro, inicio de sesión seguro y recuperación de contraseña vía email (Gmail SMTP).
- **Gestión de Roles:** Diferenciación entre administradores y usuarios estándar con permisos granulares.
- **Logs de Auditoría:** Registro automático de todas las acciones críticas realizadas por los usuarios para trazabilidad completa.

### 📦 Gestión de Inventario y Movimientos
- **Control Total:** Gestión de productos con SKU, códigos de barras (escaneo por cámara), precios de costo/venta, IVA y fechas de vencimiento.
- **Historial de Movimientos:** Módulo dedicado para visualizar cada entrada y salida de stock con filtros avanzados.
- **Alertas de Stock Bajo:** Indicadores visuales y alertas para reposición inmediata.

### 💰 Punto de Venta (POS) y Ventas
- **Interfaz Rápida:** Carrito de ventas intuitivo con búsqueda de productos y soporte para múltiples métodos de pago.
- **Gestión de Clientes:** Perfiles de clientes frecuentes con historial de compras personalizado.
- **Devoluciones:** Módulo para procesar retornos de productos y ajustes automáticos de stock.

### 🚛 Proveedores y Compras
- **Órdenes de Compra:** Generación y seguimiento de pedidos a proveedores en formato PDF.
- **Directorio de Proveedores:** Información de contacto y productos suministrados.

### 📊 Análisis y Reportes
- **Dashboard Interactivo:** Vista general con métricas en tiempo real (Ingresos mensuales, total de productos, alertas de stock).
- **Reportes Avanzados:** Generación de reportes de ventas, utilidad y movimientos en formatos PDF y Excel.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 19 · Vite · TailwindCSS 4 · Framer Motion · Lucide Icons |
| **Backend** | FastAPI · SQLAlchemy 2.0 · PostgreSQL 16 |
| **Infraestructura** | Railway (API) · Neon (Serverless Postgres) |
| **Utilidades** | JWT · Bcrypt · Axios · JSPSF · XLSX |

---

## 🚀 Despliegue en Producción

El sistema se encuentra desplegado y operativo bajo la siguiente infraestructura:

### 1. Backend (API)
- **Plataforma:** [Railway](https://railway.app/)
- **URL de Producción:** `https://product-tracker-production.up.railway.app`
- **Entorno de Ejecución:** Python 3.11.9
- **Entry Point:** `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2. Base de Datos
- **Plataforma:** [Neon](https://neon.tech/)
- **Tipo:** PostgreSQL 16+ (Serverless)
- **Región:** AWS US-East-1
- **Características:** Conexión segura SSL habilitada.

### 3. Frontend (Web App)
- **Plataforma:** Railway (Contenedor con servidor estático)
- **CORS:** Configurado para permitir peticiones desde el dominio de producción de Railway.

---

## 🔑 Variables de Entorno (Producción)

| Variable | Descripción | Fuente / Notas |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a Neon | Secreto en Railway |
| `SECRET_KEY` | Clave para firma de tokens JWT | Secreto en Railway |
| `ALGORITHM` | Algoritmo de hashing (HS256) | Configurado en el código |
| `SMTP_USER` | Email para notificaciones | Gmail |
| `SMTP_PASSWORD` | Contraseña de aplicación Gmail | Gmail App Password |

---

## 🔄 Procedimiento de Actualización

1. **Despliegue Continuo:** Cualquier cambio subido a la rama `main` en GitHub se despliega automáticamente en Railway.
2. **Base de Datos:** Las tablas se sincronizan automáticamente al iniciar la aplicación mediante SQLAlchemy (`Base.metadata.create_all`).
3. **Frontend:** El build se genera automáticamente durante el proceso de despliegue en la plataforma.

---

## ⚙️ Configuración Local

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
# Crear .env basado en .env.example
python -m uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd product-tracker
npm install
# Crear .env con VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 📂 Utilidades Técnicas
- **Compendio Técnico:** Ejecute `python build.py` para generar un archivo `compendio_tecnico_completo.txt` con todo el código fuente del proyecto para auditoría o documentación.

---

## 👨‍💻 Créditos
Desarrollado por **Yhorman Garcés**.  
*Marzo 2026*
