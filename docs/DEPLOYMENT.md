# Deploy en Cloudflare Pages

## Configuración V18
- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `public`
- Root directory: vacío

## Flujo
1. Cambiar archivos en el repo.
2. Commit a `main`.
3. Cloudflare despliega automáticamente.
4. Verificar página principal + páginas internas.
5. Revisar DevTools por errores 404/CSP.

## Cuando haya dominio propio
- cambiar canonical y `og:url`;
- cambiar URLs del sitemap;
- actualizar robots.txt;
- redirigir `maem-studio.pages.dev` al dominio nuevo con 301;
- registrar el dominio final en Search Console.
