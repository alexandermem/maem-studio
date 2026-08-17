# MAEM Studio

Sitio oficial de MAEM Studio.

## Producción
- URL actual: https://maem-studio.pages.dev
- Hosting: Cloudflare Pages
- Repositorio: GitHub
- Build actual: sitio estático, sin framework
- Build output directory: `public`

## Estructura
- `public/` → TODO lo que Cloudflare publica.
- `public/assets/` → CSS, JS e imágenes organizadas por tipo.
- `public/<servicio>/index.html` → páginas SEO con URL propia.
- `docs/` → documentación interna, no se publica.
- `tools/` → utilidades de validación, no se publica.

## Regla importante
No volver a subir los archivos internos de cada carpeta todos juntos desde el selector del navegador,
porque GitHub los renombra como `index (1).html`, `index (2).html`, etc.

Para conservar la arquitectura, usar Git/GitHub Desktop o subir carpetas completas mediante drag & drop.
