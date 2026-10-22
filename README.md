# Poncho Chat

Chat oscuro estilo FaceTime para hablar con **Poncho**. La interfaz se siente como un hilo de iMessage: fondo negro, burbujas verdes y grises, indicador de escritura y un campo `iMessage` abajo.

Es una app **Expo / React Native** pensada para web (y también Android/iOS). El deploy en Vercel publica el export estático de Expo Web.

## Requisitos

- Node.js 18 o superior
- Una API de chat **pública y con HTTPS** (Vercel no puede hablar con `192.168.x.x`)

## Arranque local

```bash
cp .env.example .env
```

Edita `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.56.1:1234/api/v1/chat
EXPO_PUBLIC_AUTH_TOKEN=tu-token
```

```bash
npm install
npm start
```

```bash
npm run web      # navegador
npm run android  # Android
npm run ios      # iOS (macOS)
```

## Configuración

| Variable | Uso |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Endpoint del chat, por ejemplo `https://tu-dominio/api/v1/chat` |
| `EXPO_PUBLIC_AUTH_TOKEN` | Token `Bearer` (no lo subas al repo) |

El cliente envía:

```json
{
  "model": "qwen2.5-coder-7b-instruct",
  "input": "texto del mensaje"
}
```

y espera `output[0].content` en la respuesta.

El backend tiene que permitir CORS desde tu dominio de Vercel (`https://tu-proyecto.vercel.app`).

## Subir a Vercel

### 1. Sube el código a GitHub

En la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Poncho Chat listo para Vercel"
```

Crea un repo vacío en GitHub y:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

No subas `.env`. El token va solo en Vercel.

### 2. Importa el repo en Vercel

1. Entra en [https://vercel.com](https://vercel.com) e inicia sesión (GitHub).
2. **Add New… → Project**.
3. Importa el repositorio de Poncho.
4. Deja el framework en **Other**. `vercel.json` ya define:
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
5. En **Environment Variables** agrega:

| Name | Value |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL **https** pública de tu API |
| `EXPO_PUBLIC_AUTH_TOKEN` | tu token |

6. **Deploy**.

La app queda en `https://tu-proyecto.vercel.app`.

### 3. Si el chat no responde desde Vercel

- `192.168.56.1` **no funciona** en producción. Expón el modelo con un túnel HTTPS (ngrok, Cloudflare Tunnel) o súbelo a un servidor.
- La API debe aceptar el origen de Vercel (CORS) y HTTPS (el navegador bloquea HTTP desde una página HTTPS).
- Si cambias variables de entorno, vuelve a hacer **Redeploy** (las `EXPO_PUBLIC_*` se incrustan en el build).

### CLI (opcional)

```bash
npm i -g vercel
npx vercel login
npx vercel
```

En el primer deploy, cuando pregunte, usa el directorio actual. Después configura las env vars en el dashboard y corre `npx vercel --prod`.

## Estructura

```
App.js          Pantalla raíz
ChatBox.js      UI del chat y llamada a la API
app.json        Configuración Expo (export web estático)
vercel.json     Build y carpeta dist para Vercel
.env.example    Plantilla de variables
```
