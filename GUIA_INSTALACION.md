# Guía de Instalación - Product Tracker

Esta guía contiene los pasos necesarios para configurar el proyecto en una nueva computadora.

## Requisitos Previos
- **Node.js** (v18 o superior)
- **Python** (3.10 o superior)
- **Git**
- **PostgreSQL** (Recomendado) o SQLite

---

## 1. Configuración del Backend (FastAPI)

Navega a la carpeta del backend:
```bash
cd backend
```

### Crear y activar entorno virtual
```bash
python -m venv venv
# En Windows:
.\venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### Instalar dependencias
```bash
pip install -r requirements.txt
```

### Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```bash
copy .env.example .env
```
Edita `.env` con tus credenciales de base de datos.

### Inicializar la Base de Datos
Puedes usar el script SQL consolidado en tu cliente de base de datos (PGAdmin/DBeaver):
- Archivo: `backend/database_init.sql`

O ejecutar el script de inicialización automático:
```bash
python init_db.py
```

### Iniciar el servidor
```bash
python start.bat
# O manualmente:
uvicorn app.main:app --reload
```
El backend estará disponible en: `http://localhost:8000`

---

## 2. Configuración del Frontend (React + Vite)

Navega a la carpeta del frontend:
```bash
cd product-tracker
```

### Instalar dependencias
```bash
npm install
```

### Iniciar el servidor de desarrollo
```bash
npm run dev
```
El frontend estará disponible en: `http://localhost:5173`

---

## Comandos Útiles

| Acción | Comando |
|--------|---------|
| Activar Venv (Backend) | `.\venv\Scripts\activate` |
| Iniciar Backend | `uvicorn app.main:app --reload` |
| Iniciar Frontend | `npm run dev` |
| Instalar nueva librería (Backend) | `pip install nombre && pip freeze > requirements.txt` |
| Instalar nueva librería (Frontend) | `npm install nombre` |
