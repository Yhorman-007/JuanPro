# Product Tracker Backend

Backend API para Product Tracker construido con FastAPI y SQLite.

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Inicializar base de datos:
```bash
python init_db.py
```

## Ejecutar

```bash
uvicorn app.main:app --reload
```

La API estará disponible en: http://localhost:8000

Documentación interactiva: http://localhost:8000/docs

## Credenciales por defecto

- Usuario: admin
- Contraseña: admin123

## Estructura

```
backend/
├── app/
│   ├── models/       # Modelos SQLAlchemy
│   ├── schemas/      # Schemas Pydantic
│   ├── api/          # Endpoints
│   ├── services/     # Lógica de negocio
│   ├── config.py     # Configuración
│   ├── database.py   # Conexión DB
│   └── main.py       # App FastAPI
├── init_db.py        # Script de inicialización
├── requirements.txt
└── .env
```

## Requisitos Funcionales Implementados

- **RF08**: Cálculo de ganancias brutas
- **RF17**: Alertas de stock mínimo
- **RF24**: Alertas de productos por caducar
- **RF41**: Reducción automática de stock en ventas
- **RF43**: Registro de ventas
