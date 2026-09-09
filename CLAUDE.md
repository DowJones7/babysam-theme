# Babysam Colombia — Rediseño de la Home

Tienda: `babysamcolombia.myshopify.com` (artículos para bebés, Cali). Tema Liquid Online Store 2.0.
Todo el trabajo vive en `master` (no hay branch `rediseno-home` separado — se descartó ese
flujo, se commitea directo). Setup local con Shopify CLI en este directorio.

## Marca

- Colores: turquesa `#78c0b3`, carmesí `#e44068`.
- Tipografía de cuerpo/botones/header: **Poppins** (400/600), vía el font picker nativo del tema
  (`config/settings_data.json`: `type_body_font`, `type_heading_font`, etc. = `poppins_n4`/`poppins_n6`).
  No es un `<link>` manual — Shopify la sirve desde `fonts.shopifycdn.com`.
- Tipografía de acento: **Fredoka** (Google Fonts, pesos 600/700), agregada manualmente
  (`layout/theme.liquid`, `<link href="fonts.googleapis.com/css2?family=Fredoka:wght@600;700">`),
  variable CSS `--font-accent` en `assets/base.css`. Se aplica a **todos los H1/H2 del sitio**
  (Hero incluido) vía `h1, h2 { font-family: var(--font-accent) !important; font-weight: 700; }`
  — el `!important` sigue siendo necesario por las reglas más específicas del tema (`.h1.h1`,
  `.h2.h2`), y el `font-weight: 700` explícito porque, a diferencia de Pacifico (peso único),
  Fredoka sí tiene variantes de peso y cae a 400 (regular, sin presencia como titular) si no se
  fuerza. Poppins se mantiene en h3-h6, botones, body text, header y footer.
  (Reemplazó a **Pacifico**, que se usó en una iteración anterior del rediseño.)
- Logo: imagen fija (Nexa Script, licencia personal — no se puede usar como webfont). No tocar.

## Estructura actual de la home (`templates/index.json`, en orden)

1. **Header** (`sections/header-group.json`) — solo `header_section`. La barra de anuncio
   ("16 años cuidando a tu bebé") que existía antes se **eliminó** del `order`.
2. **Hero** (`sections/hero.liquid`) — rediseño completo: **video de fondo** en loop
   (`babysam_hero_optimized.mp4` en `assets/`) sobre la ilustración Storyset estática
   (`banner_2_solo.png`, usada como `poster` del `<video>` y como fallback), con degradado oscuro
   inferior (`.hero__media-wrapper::after`, varias paradas de color, no el overlay nativo del
   tema) para que el texto sea legible. El video se sirve en **todos los anchos, mobile
   incluido** (un único `<source>` sin atributo `media`) — el `<source>` con
   `media="(min-width: 750px)"` de una iteración anterior se quitó a propósito: dejaba mobile sin
   fuente de video, lo que rompía el autoplay inline en iOS Safari (ver comentario Liquid en
   `sections/hero.liquid` junto al `<video>`). Es un trade-off consciente (autoplay iOS por
   encima de ahorrar los ~6MB en datos móviles); si el consumo de datos vuelve a ser un problema,
   la vía sugerida en ese mismo comentario es reencodear a H.264 Main/High L4.0 + faststart (perfil
   más liviano) en vez de volver a poner el `media` query. Texto centrado (titular "Todo para tu
   bebé, en un solo lugar" + botón
   "Comprar ahora"), animaciones con AOS (ver más abajo). Ken Burns (CSS puro) sigue aplicando
   sobre la imagen cuando no hay video. Mobile con composición apilada imagen→texto (ver bug
   documentado abajo); el breakpoint de ese rediseño mobile es `max-width: 990px`, no 750px.
3. **Marquee de marcas** (`brands_marquee`, usa `sections/marquee.liquid`) — scroll infinito CSS
   puro: Dr. Brown's, Pigeon, Rascal+Friends (`rascals_logo-removebg-preview.png`), Palmer's,
   Genial, Philips Avent, Little Me, Momcozy, Kidilo, MaxiBaby (10 logos).
4. **Fila de confianza** (`trust_row`) — fondo turquesa sólido (`scheme-trust-turquoise`), texto
   e íconos blancos: "Envíos seguros" / "Cuotas sin interés" (link Addi) / "Tiendas físicas".
5. **Catálogo Babysam** (`carrusel_productos_w3cKLp`, `sections/carrusel-productos.liquid`) —
   ahora **18 categorías** (se ampliaron desde las 13 originales: se agregaron Corrales
   —handle `coleccion-mi-primer-dia`—, Cuidado Materno, Lactancia, Aseo, Ajuares, Bañeras,
   Gimnasios y Silla de carro). Carrusel en grid de **2 filas** (`grid-auto-flow: column`),
   con botones prev/next (visibles desde 750px) además del drag de mouse/touch — ambos
   mecanismos ahora viven en `assets/carousel-controller.js` (script compartido, antes era CSS
   puro inline). Animación de entrada por tarjeta con AOS (`data-aos="fade-up"`, delay
   escalonado). La foto de cada tarjeta sigue sin depender de `collection.image` ni de código:
   cada categoría tiene su propio campo `image_picker` en el schema de la sección
   (`image_accesorios`, `image_mi_primer_dia`, etc. — 18 en total, uno por handle de colección),
   editable desde el Theme Customizer con label en español ("Foto de Accesorios", "Foto de
   Corrales" para `coleccion-mi-primer-dia`, "Foto de Didacticos" para `jugueteria`, ...). El
   mapeo handle→campo vive en un `case` dentro de `sections/carrusel-productos.liquid`; si se
   agrega una categoría nueva con un handle distinto a los 18 actuales, hay que agregar su campo
   en el schema y su rama en el `case` (eso sí requiere código). **Ya se están subiendo fotos
   desde el Theme Customizer (en progreso, no completo)** — mientras un campo esté vacío, esa
   tarjeta sigue mostrando solo el mosaico `backupd_catalogo` de fondo.
6. **Divider** (`divider_zApW4A`) — separador simple entre el catálogo y el banner de abajo.
7. **Banner "Regala Felicidad"** (`section_qNjNr8`) — Bono de Regalo, foto `bono.png` ($50.000).
8. **Testimonios** (`testimonials_row`, `sections/testimonials-carousel.liquid`) — carrusel con
   drag+snap (script propio inline en la sección, no comparte `carousel-controller.js` con el
   catálogo aunque el patrón es el mismo), bloques tipo `review` (rating/quote/author, editable
   desde el theme editor sin tocar código). 5 reseñas reales cargadas. **Nota de orden**: ahora
   va antes de Baby Shower (antes iba después).
9. **Baby Shower completo** (`baby_shower_full`) — formulario + video vertical (TikTok,
   `Download (3).mp4`, 38% ancho desktop / 100% mobile apilado).
10. **Instagram** (`instagram_feed`, `sections/instagram-feed.liquid`) — sección compacta antes
    del footer, grid de 6 fotos reales (`IG_foto_1.jpg`...`IG_foto_7.jpg`), todas linkean al perfil.
11. **Footer** — crédito a Storyset **ya agregado** (`blocks/footer-utilities.liquid`, junto al
    copyright, en Liquid directo — ver razón en bugs abajo).

## Animaciones (AOS)

Se agregó **AOS (Animate On Scroll)** auto-hospedado en `assets/` (`aos.js`, `aos.css`,
`aos-init.js`), cargado en `layout/theme.liquid`. Init: `duration: 300, easing: 'ease-out',
once: true, offset: 40`, deshabilitado bajo `prefers-reduced-motion` de dos formas: por JS
(`disable` callback en `aos-init.js`) y como red de seguridad en `assets/base.css`
(`@media (prefers-reduced-motion: reduce) { [data-aos] { opacity: 1 !important; ... } }`) por si
el JS no alcanza a correr antes del primer pintado. Se usa en las tarjetas del catálogo
(`fade-up` escalonado) y en bloques del Hero.

## Bugs/particularidades del tema descubiertas (importante para no repetir trabajo)

- **`blocks/text.liquid` está simplificado**: solo respeta `text` (el HTML), `alignment` y
  `image`/`max_width`. Ignora `color`, `font_size`, `type_preset` por completo. Para cambiar
  tamaño/color de un título dentro de un bloque "text", la única palanca real es qué **etiqueta**
  HTML se usa (`<h2>` hereda el tamaño global de h2, etc.) — no las settings del bloque.
- **Bug real encontrado y corregido en `blocks/text.liquid`**: la alineación (`alignment`) nunca
  se aplicaba en ningún lugar del tema que usara este bloque. Causa: el `<style>` inyectado
  apuntaba a `#shopify-section-{{ block.id }} .richtext-content`, pero ese ID no existe en el DOM
  — el wrapper automático de Shopify usa el ID de la **sección**, no el del bloque. Se corrigió
  pasando `text-align` como `style=` inline directo en el `<div class="richtext-content">`.
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
- **Breakpoint 749px no siempre dispara en dispositivos reales**: en varios puntos (Hero mobile,
  `trust_row`) el `@media (max-width: 749px)` que sí funcionaba en DevTools no entraba en un
  iPhone real. Se resolvió ampliando esos breakpoints puntuales a `990px`. El breakpoint que
  controla si el layout general se apila (`.mobile-column` en `base.css`) sigue en 749px sin
  tocar — el ajuste es solo en las reglas nuevas agregadas para estas secciones específicas.
- **`.motion-reduce`**: el tema ya marca esta clase en varios componentes (drawer del menú
  mobile, carrito, selectores de idioma/país) pero nunca tuvo una regla CSS que la implementara
  — quedaba sin efecto. Se implementó en `assets/base.css` (mata `animation`/`transition` en el
  elemento y sus descendientes bajo `prefers-reduced-motion: reduce`).
- Clase reutilizable `.home-section-title` / `.home-section-body` en `assets/base.css` para
  tamaños de título/cuerpo consistentes entre secciones del home (Catálogo, Testimonios, el
  formulario de Baby Shower, etc.; no todas la usan porque el sanitizador bloquea `class=` en
  bloques "text" — ver arriba).
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
  expira).
- Se subió un snapshot **sin publicar** con `shopify theme push --unpublished`:
  tema **"Rediseño Home - Babysam (definitivo)" (#164461871352)**, útil para que alguien más lo
  revise sin depender de que el `theme dev` local siga corriendo. Preview:
  `https://babysamcolombia.myshopify.com?preview_theme_id=164461871352`.
  **Ese snapshot quedó desactualizado**: es de antes del rediseño de Hero con video/Fredoka/AOS y
  del catálogo de 18 categorías (commit `f588c9f` y posteriores) — si se necesita compartir una
  preview al día, hay que volver a correr el `push --unpublished`. (A su vez reemplaza al
  snapshot anterior #164147560696, que no usar.)
- **Nada de esto está publicado como tema en vivo.** El sitio público sigue en el tema anterior.
- Working tree con un cambio sin commitear: `assets/babysam_hero_optimized.mp4` (binario
  modificado, probablemente una reoptimización del video del Hero — confirmar antes de commitear
  o descartar). `.claude/` está untracked pero es configuración local de la herramienta, no
  contenido del tema — no hace falta commitearlo.

## Pendientes reales (bloqueados en insumos externos, no en código)

1. Fotos de producto de cada colección sin el patrón/título quemado (las produce el jefe del
   cliente) — **en progreso**: ya se están subiendo una por una en el Theme Customizer, sección
   "Catálogo Babysam" → campos "Foto de Accesorios" / "Foto de Corrales" / etc., pero no están
   las 18 completas todavía. No requiere tocar código salvo que se agregue una categoría nueva.
