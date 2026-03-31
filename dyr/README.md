# D&R – Diarios y Revistas

Una PWA que reúne los principales diarios argentinos en una sola app. Pensada para adultos mayores: letra grande, alto contraste, sin complicaciones.

## Desarrollo

```bash
cd dyr
npm install
npm run dev
```

## Deploy en Vercel

```bash
cd dyr
npx vercel
```

No requiere variables de entorno ni configuración adicional.

## Agregar Capacitor para app nativa

Para convertir esta PWA en una app nativa de Android/iOS usando Capacitor:

```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inicializar Capacitor
npx cap init "D&R" "com.dyr.app" --web-dir=out

# 3. Configurar Next.js para export estático:
#    En next.config.ts agregar: output: "export"

# 4. Generar el build estático
npm run build

# 5. Agregar plataforma Android
npm install @capacitor/android
npx cap add android

# 6. Sincronizar y abrir en Android Studio
npx cap sync
npx cap open android
```

Para iOS, reemplazar `android` por `ios` e instalar `@capacitor/ios`.

La estructura de componentes está preparada para funcionar dentro de Capacitor sin cambios. No se usan APIs exclusivas del navegador que no estén disponibles en el WebView de Capacitor.
