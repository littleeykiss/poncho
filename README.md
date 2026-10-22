# Poncho Chat

Chat oscuro estilo FaceTime para hablar con **Poncho**. La interfaz se siente como un hilo de iMessage: fondo negro, burbujas verdes y grises, indicador de escritura y un campo `iMessage` abajo.

Es una app **Expo / React Native** que también corre en web.

## Requisitos

- Node.js 18 o superior
- El backend de chat en marcha (por defecto `http://192.168.56.1:1234/api/v1/chat`)

## Arranque

```bash
npm install
npm start
```

Luego elige plataforma en la terminal de Expo, o usa un script directo:

```bash
npm run web      # navegador (http://localhost:8081)
npm run android  # dispositivo o emulador Android
npm run ios      # simulador iOS (macOS)
```

## Configuración

| Qué | Dónde |
| --- | --- |
| URL de la API | `API_URL` en `ChatBox.js` |
| Token de autorización | `expo.extra.authToken` en `app.json` |
| Modelo | `qwen2.5-coder-7b-instruct` en `sendMessage` (`ChatBox.js`) |

El cliente envía:

```json
{
  "model": "qwen2.5-coder-7b-instruct",
  "input": "texto del mensaje"
}
```

con `Authorization: Bearer <token>` y espera `output[0].content` en la respuesta.

Si cambias de red, actualiza `API_URL` a la IP de tu máquina. No subas tokens reales al repositorio; trátalos como secreto.

## Estructura

```
App.js        Pantalla raíz, fondo negro y status bar clara
ChatBox.js    Conversación, burbujas, compositor y llamada a la API
app.json      Configuración de Expo (nombre, token, assets)
```

## Interfaz

- Encabezado de contacto: avatar, nombre **Poncho**, etiqueta FaceTime
- Mensajes propios a la derecha (verde), respuestas a la izquierda (gris)
- Fecha `Hoy`, estado `Entregado` y puntos animados mientras Poncho escribe
- En pantallas anchas el chat se centra con un ancho máximo tipo teléfono
