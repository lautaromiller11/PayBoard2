# Integración Bot de Telegram (MVP)

Este bot permite registrar ingresos y gastos desde Telegram usando las mismas categorías de la web.

## Configuración

1. Crea un bot con @BotFather y copia el token.
2. En `backend/.env`, agrega:
   ```env
   TELEGRAM_BOT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   # Opcional: setea la URL base de la API si no corre local
   BOT_API_BASE=https://<tu-backend>.railway.app/api
   ```
3. Instala dependencias del backend y ejecuta:
   ```bash
   npm install
   npm run dev
   ```

> En Railway, configura estas variables en el panel de Variables.

## Uso

- `/start` inicia el flujo. Si no hay sesión, solicita login.
- `/login <email> <password>` inicia sesión (usa el login estándar de la API).
- Selecciona tipo (Ingreso/Gasto) con botones, luego categoría, y escribe el monto.
- El bot crea la transacción vía `POST /api/transacciones`.
- `/cancel` cancela el flujo actual. `/logout` cierra sesión.

## Endpoints usados

- `POST /api/auth/login` – para obtener el JWT del usuario.
- `GET /api/transacciones/categorias?tipo=<ingreso|gasto>` – trae categorías.
- `POST /api/transacciones` – crea la transacción. Payload ejemplo:
  ```json
  {
    "tipo": "gasto",
    "monto": 1234.56,
    "descripcion": "Agregado desde Telegram",
    "categoria": "Alimentación",
    "fecha": "2025-08-11T12:00:00.000Z",
    "periodicidad": "unico"
  }
  ```

## Vinculación de cuenta

MVP: Autenticación directa con `/login <email> <password>`.
Alternativa manual: Desde la web, en Perfil, permitir ingresar el usuario de Telegram o teléfono y enlazar en backend (no implementado aquí).

## Pruebas manuales

1. Ejecuta backend con `TELEGRAM_BOT_TOKEN` configurado.
2. En Telegram, envía `/start`.
3. Envía `/login <email> <password>`.
4. Sigue el flujo tipo → categoría → monto.
5. Verifica en la web que la transacción aparezca.

## Notas

- El estado de conversación se mantiene en memoria (se pierde al reiniciar). Para producción, usar Redis/DB.
- Validación de monto (> 0). Manejo de errores de API con mensajes amigables.
