# Arquitectura MAEM Studio · V18

## Objetivo
Mantener una base simple hoy, pero preparada para crecer sin romper URLs, SEO, formulario ni despliegues.

## Capas

### 1. `public/`
Es la salida de producción. Cloudflare Pages debe publicar SOLO esta carpeta.

Esto nos permite añadir en el futuro:
- una carpeta `src/` con componentes;
- Vite u otro bundler;
- generación de páginas;
- un CMS;
- scripts de build;
sin mezclar código de desarrollo con archivos públicos.

### 2. `public/assets/`
Separado en:
- `css/`
- `js/`
- `img/brand/`
- `img/payments/`
- `img/social/`

Una imagen o logo existe una sola vez y se reutiliza en todo el sitio.

### 3. Páginas con URL estable
Cada servicio vive en una carpeta:
- `/invitaciones-digitales/`
- `/paginas-web/`
- `/mejora-de-procesos/`
- `/proyectos/`
- `/sobre-maem/`

El día que migremos a Vite, Astro, Next u otro sistema, estas URLs deben conservarse.

### 4. Backend del formulario
El formulario actualmente usa Google Apps Script.
Regla: la URL del backend no debe copiarse en múltiples archivos si más adelante creamos nuevas páginas con formulario.
En una futura refactorización se moverá a una configuración central.

### 5. Pagos
MAEM solo informa que acepta Visa/Mastercard mediante Poket.
No se capturan ni almacenan datos de tarjetas en el sitio.

### 6. SEO
- Canonical absoluto.
- Sitemap.
- robots.txt.
- OAI-SearchBot permitido.
- Una intención principal por página.
- Enlaces internos HTML reales.
- Structured data en páginas relevantes.

### 7. Seguridad
Cloudflare aplica `_headers`.
Nunca guardar secretos/API keys en HTML o JavaScript público.
Datos sensibles y credenciales deben vivir únicamente en servicios de servidor/secret managers.

## Próxima evolución recomendada
Cuando el sitio empiece a tener 15–20 páginas o contenido que cambie con frecuencia:
1. introducir Vite;
2. mover HTML fuente a `src/`;
3. generar `public/` o `dist/`;
4. mantener las URLs existentes;
5. centralizar navegación, footer, SEO y configuración de marca.
