# Guía de Verificación Integral (Fases 2, 3 y 4)

Esta guía detalla cómo comprobar que todo el sistema de **Product Tracker** funciona correctamente, desde la base de datos hasta la interfaz visual.

---

## 🏗️ 1. Orden de Encendido y Conexión
Para que el sistema funcione, debes seguir estrictamente este orden:

### Paso A: La Base de Datos (PostgreSQL/SQLite)
Asegúrate de que tu base de datos esté activa. Si usas PostgreSQL, el servicio debe estar corriendo.
- **Archivo de inicialización**: `backend/database_init.sql` (Ejecutar en tu gestor de BD si es la primera vez).

### Paso B: El Backend (API FastAPI)
El backend es el puente entre la base de datos y la web.
> [!IMPORTANT]
> **Versión de Python**: Se recomienda usar **Python 3.11** o **3.12**.
> Si usas **Python 3.14** (versión experimental), podrías tener errores al instalar librerías porque aún no hay versiones compatibles listas para descargar.

1. Abre una terminal en `backend`.
2. Activa el entorno: `.\venv\Scripts\activate`
3. Inicia el servidor: `python -m uvicorn app.main:app --reload`
4. **Verificación**: Abre [http://localhost:8000/health](http://localhost:8000/health). Debes ver `{"status": "healthy"}`.

### Paso C: El Frontend (React + Vite)
La interfaz visual que consume la API.
1. Abre una terminal en `product-tracker`.
2. Inicia el modo desarrollo: `npm run dev`
3. **Verificación**: Abre [http://localhost:5173](http://localhost:5173).

---

## 🔐 2. Verificación Fase 2: Autenticación y Seguridad
**Objetivo**: Confirmar que nadie sin permiso puede entrar y que el login funciona.

1. **Prueba de Acceso Forzado**: Intenta entrar directamente a `http://localhost:5173/inventory`.
   - *Resultado esperado*: El sistema te debe redirigir automáticamente a la página de `/login`.
2. **Prueba de Login Real**: Ingresa `admin` y `admin123`.
   - *Resultado esperado*: Entras al Panel Principal. El Token se guarda en el navegador (puedes verlo en F12 -> Application -> Local Storage).
3. **Prueba de Error**: Ingresa datos falsos.
   - *Resultado esperado*: Mensaje "Usuario o contraseña incorrectos".

---

## 📦 3. Verificación Fase 3: Gestión de Productos y Stock
**Objetivo**: Validar que los datos se guardan en la base de datos real y los cálculos son correctos.

1. **Crear Producto**: Ve a Inventario y crea un producto (ej: "Aspirina", SKU: "ASP01", Precio Compra: 10, Precio Venta: 15, Stock: 20).
   - *Resultado esperado*: El producto aparece en la tabla. El "Margen de Ganancia" debe decir 5.00 automáticamente (Fase 3).
2. **Actualizar Stock (Entrada/Salida)**: Registra una salida de 15 unidades.
   - *Resultado esperado*: El stock baja a 5 en la pantalla y en la base de datos.
3. **Persistencia**: Cierra el navegador, detén el frontend y vuelve a iniciarlo.
   - *Resultado esperado*: El producto "Aspirina" con stock 5 sigue ahí (viniendo de la BD, no es temporal).

---

## 📊 4. Verificación Fase 4: Dashboard y Conexión Real
**Objetivo**: Confirmar que los indicadores del panel principal reflejan la realidad de la BD.

1. **Valor de Inventario**: Si tienes 5 Aspirinas a costo 10, el Dashboard debe mostrar "Valor en Stock: $50.00".
2. **Alertas en Tiempo Real**: Como el stock de Aspirina es 5 (y suele ser menor al mínimo), debe aparecer una tarjeta en "Atención Requerida" indicando "Reponer Aspirina".
3. **Sincronización de Ventas**: Realiza una venta en el módulo POS.
   - *Resultado esperado*: El contador "Ventas Hoy" en el Dashboard debe actualizarse sumando el monto de esa venta.
4. **Indicador de Carga**: Al entrar al Dashboard, verifica que aparezca el spinner de "Actualizando datos...". Esto confirma que está consultando la API en ese momento.

---

## 🛠️ Comandos de Rescate
Si algo falla, ejecuta estos comandos en sus respectivas carpetas:

| Problema | Solución |
| :--- | :--- |
| **ModuleNotFoundError: No module named 'jose'** | Ejecuta: `pip install "python-jose[cryptography]"` |
| **Error de módulos (Front)** | `npm install` (en `product-tracker`) |
| **Error de módulos (Back)** | `pip install -r requirements.txt` (en `backend`) |
| **Base de datos bloqueada** | Reinicia la terminal del backend |
| **Frontend no conecta** | Revisa que el backend esté en el puerto 8000 |
