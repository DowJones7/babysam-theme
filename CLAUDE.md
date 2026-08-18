# Babysam Colombia — Rediseño de la Home

Tienda: `babysamcolombia.myshopify.com` (artículos para bebés, Cali). Tema Liquid Online Store 2.0.
Rama de trabajo: `rediseno-home`. Setup local con Shopify CLI en este directorio.

## Marca

- Colores: turquesa `#78c0b3`, carmesí `#e44068`.
- Tipografía de cuerpo/botones/header: **Poppins** (400/600), vía el font picker nativo del tema
  (`config/settings_data.json`: `type_body_font`, `type_heading_font`, etc. = `poppins_n4`/`poppins_n6`).
  No es un `<link>` manual — Shopify la sirve desde `fonts.shopifycdn.com`.
- Tipografía de acento: **Pacifico** (Google Fonts, peso único 400), agregada manualmente
  (`layout/theme.liquid`, `<link href="fonts.googleapis.com/css2?family=Pacifico">`), variable
  CSS `--font-accent` en `assets/base.css`. Se aplica a **todos los H1/H2 del sitio** (Hero
  incluido) vía `h1, h2 { font-family: var(--font-accent) !important; }` — el `!important` es
  necesario porque el tema tiene reglas más específicas (`.h1.h1`, `.h2.h2`) que si no le ganan.
  Poppins se mantiene en h3-h6, botones, body text, header y footer.
- Logo: imagen fija (Nexa Script, licencia personal — no se puede usar como webfont). No tocar.

## Estructura actual de la home (`templates/index.json`, en orden)

1. **Header + 1 barra de anuncio** (`sections/header-group.json`) — "16 años cuidando a tu bebé", negrilla.
2. **Hero** (`sections/hero.liquid`) — ilustración Storyset (`banner_2_solo.png`, extendida, sin
   texto quemado, crédito obligatorio pendiente en footer), animación Ken Burns (CSS puro),
   titular "Todo para tu bebé, en un solo lugar" + botón "Comprar ahora". Mobile rediseñado
   (apilado imagen→texto, ver sección de bugs abajo).
3. **Marquee de marcas** (`brands_marquee`, usa `sections/marquee.liquid`) — scroll infinito CSS
   puro: Dr. Brown's, Pigeon, Rascal+Friends (`rascals_logo-removebg-preview.png`), Palmer's,
   Genial, Philips Avent, Little Me, Momcozy, Kidilo, MaxiBaby (10 logos).
4. **Fila de confianza** (`trust_row`) — fondo turquesa sólido (`scheme-trust-turquoise`), texto
   e íconos blancos: "Envíos seguros" / "Cuotas sin interés" (link Addi) / "Tiendas físicas".
5. **Catálogo Babysam** (`carrusel_productos_w3cKLp`, `sections/carrusel-productos.liquid`) —
   carrusel de categorías con drag de mouse + scroll-snap. La foto de cada tarjeta ya **no**
   depende de `collection.image` (la imagen de la Colección en el Admin, que trae el patrón/título
   quemados en los píxeles) ni de código: cada categoría tiene su propio campo `image_picker` en
   el schema de la sección (`image_accesorios`, `image_caminadores`, etc. — 13 en total, uno por
   handle de colección), editable desde el Theme Customizer con label en español ("Foto de
   Accesorios", ...). El mapeo handle→campo vive en un `case` dentro de
   `sections/carrusel-productos.liquid`; si se agrega una categoría nueva con un handle distinto
   a los 13 actuales, hay que agregar su campo en el schema y su rama en el `case` (eso sí requiere
   código). Todos los campos están vacíos por defecto — mientras no se suba nada, la tarjeta
   muestra solo el mosaico `backupd_catalogo` de fondo, igual que antes.
6. **Banner "Regala Felicidad"** (`section_qNjNr8`) — Bono de Regalo, foto `bono.png` ($50.000).
7. **Baby Shower completo** (`baby_shower_full`) — formulario + video vertical (TikTok,
   `Download (3).mp4`, 38% ancho desktop / 100% mobile apilado). El banner corto redundante que
   estaba a mitad de home se eliminó.
8. **Testimonios** (`testimonials_row`, `sections/testimonials-carousel.liquid`) — carrusel con
   el mismo patrón de drag+snap del catálogo, bloques tipo `review` (rating/quote/author, editable
   desde el theme editor sin tocar código). 5 reseñas reales cargadas.
9. **Instagram** (`instagram_feed`, `sections/instagram-feed.liquid`) — sección compacta antes del
   footer, grid de 6 fotos reales (`IG_foto_1.jpg`...`IG_foto_7.jpg`), todas linkean al perfil.
10. **Footer** — falta agregar el crédito a Storyset por la ilustración del Hero.

## Bugs/particularidades del tema descubiertas (importante para no repetir trabajo)

- **`blocks/text.liquid` está simplificado**: solo respeta `text` (el HTML), `alignment` y
  `image`/`max_width`. Ignora `color`, `font_size`, `type_preset` por completo. Para cambiar
  tamaño/color de un título dentro de un bloque "text", la única palanca real es qué **etiqueta**
  HTML se usa (`<h2>` hereda el tamaño global de h2, etc.) — no las settings del bloque.
- **El sanitizador de contenido de Shopify** (campos tipo texto/richtext en JSON) **rechaza**:
  el atributo `style=`, el atributo `class=`, y la etiqueta `<small>`. Solo sobreviven tags
  semánticos (h1-h6, p, strong, a, ul/li, etc.). Si necesitas una clase o estilo puntual, hay que
  ponerlo en el archivo `.liquid` real (no sanitizado), no en el `"text"` de un bloque JSON.
- **Especificidad**: el tema tiene reglas `.h1.h1`, `.h2.h2` (doble clase) que le ganan a un
  selector simple `h1`/`h2`. Usar `!important` si necesitas una regla global de verdad.
- **`{% stylesheet %}` no procesa Liquid**: `{{ section.id }}` dentro de un bloque stylesheet
  queda como texto literal, no se interpola. Pasar valores dinámicos vía `style="--var: {{ valor }}"`
  inline en el HTML y consumirlos con `var(--var)` en el CSS.
- **Flexbox en `flex-direction: column`**: `align-items` pasa a controlar el eje horizontal (no
  el vertical). Causó un bug real en el Hero mobile (imagen y texto se encogían centrados en vez
  de ocupar el ancho completo) — se corrigió con `align-items: stretch`.
- Clase reutilizable `.home-section-title` / `.home-section-body` en `assets/base.css` para
  tamaños de título/cuerpo consistentes entre secciones del home (no todas la usan porque el
  sanitizador bloquea `class=` en bloques "text" — ver arriba).
- **Bug preexistente corregido**: los títulos h1-h6 quedaban con color inválido (heredaban del
  padre en vez de usar el color del esquema) en cualquier sección con `color_scheme: scheme-3` o
  `scheme-7`. Causa raíz: `assets/base.css` referenciaba la variable `--font-h{N}-color` (un solo
  guion) para el color de cada heading, pero la variable que de verdad se define en
  `snippets/color-schemes.liquid` y `snippets/theme-styles-variables.liquid` es
  `--font-h{N}--color` (doble guion) — nombre distinto, la variable nunca existía y el `color`
  quedaba inválido. Como en `scheme-3`/`scheme-7` el elemento padre (`<a>` de la tarjeta) usa
  `--color-primary` transparente, el texto se volvía invisible — eso afectaba el título de cada
  tarjeta del catálogo, "Regala Felicidad a La Medida del Bebe", "Bono de Regalo Babysam" y
  "Síguenos @babysamcolombia". Arreglado en `assets/base.css` (las 6 reglas h1-h6, agregando el
  segundo guion). Además, `scheme-3` y `scheme-7` en `config/settings_data.json` tenían
  `foreground_heading` igual al `background` (blanco sobre blanco) — se corrigió a `#a27349`
  (el café que ya usa el resto del sitio para headings sobre fondo crema), como red de seguridad
  adicional por si algún otro lugar del tema sí lee la variable con nombre correcto.

## Estado del despliegue

- `shopify theme dev` crea un **development theme efímero** nuevo cada vez que se corre sin
  `--theme=<id>` (el ID cambia en cada sesión, no vale la pena anotarlo aquí). El token de sesión
  vence cada cierto tiempo — si tira "access token expired": Ctrl+C, `shopify auth logout`,
  volver a correr `shopify theme dev`.
- **Para editar en vivo el tema "Rediseño Home - Babysam (definitivo)" en vez de crear otro
  efímero desconectado, usar siempre:**
  ```
  shopify theme dev --theme=164461871352
  ```
  Esta carpeta local **no** queda enlazada a ningún theme ID de forma persistente entre sesiones
  (el CLI no guarda un config por-proyecto, solo un "development theme" global por tienda que
  expira). Confirmado el 2026-08-18: el development theme de la última sesión (ID `164459118840`)
  ya no existía en `shopify theme list` — corriendo `shopify theme dev` sin `--theme=` se crea
  uno nuevo y desconectado del definitivo.
- Se subió además un snapshot **sin publicar** con `shopify theme push --unpublished`:
  tema **"Rediseño Home - Babysam (definitivo)" (#164461871352)**, útil para que alguien más lo
  revise sin depender de que el `theme dev` local siga corriendo. Preview:
  `https://babysamcolombia.myshopify.com?preview_theme_id=164461871352`. Incluye el catálogo
  editable (campos "Foto de Accesorios", etc.) — verificado descargando esos archivos
  directamente del tema remoto. (Reemplaza al snapshot anterior #164147560696, que quedó
  desactualizado — sigue existiendo en la tienda pero no usarlo.)
- **Nada de esto está publicado como tema en vivo.** El sitio público sigue en el tema anterior.
- Hay cambios sin commitear en git (varios archivos) — commitear por lote lógico antes de
  fusionar `rediseno-home`, no todo junto.

## Pendientes reales (bloqueados en insumos externos, no en código)

1. Fotos de producto de cada colección sin el patrón/título quemado (las va a producir el jefe
   del cliente) — ya **no** requiere tocar código: se suben una por una en el Theme Customizer,
   sección "Catálogo Babysam" → campos "Foto de Accesorios" / "Foto de Caminadores" / etc.
2. Crédito a Storyset en el footer (obligatorio por la licencia gratuita de la ilustración del Hero).
