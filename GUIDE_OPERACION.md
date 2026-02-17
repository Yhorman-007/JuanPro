# Guía de Verificación: Fases 2 y 3

Esta guía te ayudará a comprobar que todo el trabajo realizado en las **Fases 2 y 3** funciona correctamente. Está diseñada para ser seguida paso a paso, incluso si no tienes conocimientos técnicos.

---

## 🚀 Paso 1: Iniciar el Sistema

1. Abre la carpeta del proyecto en tu computadora.
2. Busca el archivo llamado `start.bat` dentro de la carpeta `backend`.
3. Haz doble clic en `start.bat`. Se abrirá una ventana negra (consola). **No la cierres**, esta ventana debe estar abierta para que el sistema funcione.

---

## 🔑 Paso 2: Probar Inicio de Sesión (Fase 2)

Vamos a usar la "Documentación Interactiva" (Swagger) para probar el sistema:

1. Abre tu navegador y ve a: [http://localhost:8000/docs](http://localhost:8000/docs)
2. Busca la sección **auth** y haz clic en `POST /api/auth/login/access-token`.
3. Haz clic en el botón **"Try it out"**.
4. En los campos que aparecen, escribe:
   - **username**: `admin`
   - **password**: `admin123`
5. Haz clic en **"Execute"**.
6. **Resultado esperado**: Deberías ver un código `200` y un texto largo llamado "access_token". Esto significa que el inicio de sesión funciona.

---

## 👤 Paso 3: Registrar un nuevo Administrador y Usuario (Fase 2)

1. Busca la sección **users** y haz clic en `POST /api/users/`.
2. Haz clic en **"Try it out"**.
3. En el cuadro de texto (Body), copia y pega esto para crear un **Administrador**:
   ```json
   {
     "email": "nuevo_admin@ejemplo.com",
     "password": "password123",
     "username": "superadmin",
     "full_name": "Administrador de Prueba",
     "is_admin": true
   }
   ```
4. Haz clic en **"Execute"**. Repite el proceso cambiando los datos (ej: `is_admin: false`) para crear un usuario normal.
5. **Resultado esperado**: Código `201` y los datos del usuario creado.

---

## 📦 Paso 4: Probar Productos (Fase 3)

1. Busca la sección **products** y haz clic en `POST /api/products/`.
2. Haz clic en **"Try it out"** y pega esto:
   ```json
   {
     "name": "Coca Cola 2L",
     "sku": "COKE001",
     "category": "Bebidas",
     "price_purchase": 1.50,
     "price_sale": 2.50,
     "unit": "Unidad",
     "stock": 10,
     "min_stock": 5
   }
   ```
3. Haz clic en **"Execute"**.
4. **Resultado esperado**: El sistema responderá con los datos del producto y verás un campo llamado `gross_profit: 1.0`. ¡Esto confirma que el cálculo de ganancias funciona!

---

## 📉 Paso 5: Control de Inventario y Alertas (Fase 3)

1. **Baja de Stock**: Busca `POST /api/stock-movements/`.
2. Registra una salida de 6 unidades para el producto que creaste (usa su `id`, que suele ser 1 si es el primero).
   ```json
   {
     "product_id": 1,
     "quantity": 6,
     "type": "EXIT",
     "reason": "Venta manual"
   }
   ```
3. **Comprobar Alerta**: Ahora busca `GET /api/products/alerts/low-stock` y haz clic en **"Execute"**.
4. **Resultado esperado**: Como el stock bajó a 4 (y el mínimo era 5), el producto debería aparecer en esta lista de alertas.

---

## ✅ Conclusión de la Fase 3
Si todos estos pasos funcionaron, tu sistema tiene una base sólida:
- [x] Los usuarios pueden entrar de forma segura.
- [x] Se pueden crear roles (Admin/Usuario).
- [x] Los productos calculan sus ganancias automáticamente.
- [x] El inventario te avisa cuando te quedas sin stock.

**¡Estamos listos para la Fase 4: Panel de Control y Frontend!** 🚀
