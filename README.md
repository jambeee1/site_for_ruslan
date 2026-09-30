# Ruslan Matuliak — портфолио

Статичный сайт-портфолио режиссёра и монтажёра Руслана Матуляка. Дизайн сделан в Claude Design и распакован в обычную структуру файлов: сборка и сервер не нужны.

## Структура

```
wrangler.jsonc          настройки Cloudflare: публикуется папка public/, сборки нет
public/                 всё, что уходит на сервер
  index.html            страница целиком: разметка, стили, логика анимаций
  404.html              страница «не найдено»
  robots.txt, sitemap.xml, _headers
  assets/
    js/                 dc-runtime (движок Claude Design) + React 18
    fonts/              шрифты (только латиница)
    img/                фото (WebP), обложка для соцсетей og-cover.jpg
    img/posters/        превью-кадры видео
    icons/              favicon и иконка для iPhone
    video/              превью: .mp4 (H.264) и .webm (VP9)
```

Сайт сам выбирает формат видео: WebM (VP9) в Chrome, Edge и Firefox, MP4 в Safari и на iPhone. Полные версии роликов открываются с Vimeo.

## Посмотреть локально

```bash
cd public && python3 -m http.server 8000
# открыть http://localhost:8000
```

Или на том же движке, что и в Cloudflare: `npx wrangler dev`.

## Публикация

Сайт работает на **Cloudflare Workers** и подключён к ветке `main` этого репозитория. Каждое изменение в `main` публикуется автоматически (Deploy command: `npx wrangler deploy`, Build command: пусто). Настройки лежат в `wrangler.jsonc`.

### Домен

Сайт настроен на адрес **https://ruslanthedirector.online/**: канонический адрес, полные ссылки на обложку для превью, `sitemap.xml` и строка `Sitemap` в `robots.txt`. Если адрес поменяется, найдите и замените `ruslanthedirector.online` в `public/`.

После запуска:
1. Добавить сайт в Google Search Console и Яндекс Вебмастер, отправить `sitemap.xml`.
2. Проверить превью ссылки: https://www.opengraph.xyz или отправить ссылку себе в Telegram.
3. По желанию подключить аналитику (Cloudflare Web Analytics, Plausible или GA4).

## Как править контент

Весь текст находится в `public/index.html` внутри тега `<x-dc>`. Каждая секция помечена атрибутом `data-screen-label` («Hero», «01 Frog Invader», «02 Racks On Racks», «03 Night Parking», «04 Vertical Format Videos», «About»). Выражения в `{{ … }}` подставляются скриптом, их не трогать.

Ссылки на полные ролики на Vimeo задаются в `vimeo = { … }` в скрипте компонента (внизу `index.html`).

### Добавить или заменить видео

В `public/assets/video/` лежат два вида роликов:

- **Превью** (showreel, frog, racks, np): 11–13-секундные фрагменты без звука, 1080p. Полные версии открываются с Vimeo.
- **Вертикальные** (grailed, f1, rd): беззвучные превью 720×1280 для карусели. Полные версии открываются с Vimeo.

Каждое видео хранится в двух форматах. Сайт отдаёт WebM (VP9, примерно вдвое легче) в Chrome, Edge и Firefox, а MP4 (H.264) — в Safari и на iPhone. Команды для нового превью (`-ss` — начало фрагмента, `-t` — длительность):

```bash
ffmpeg -ss 5.8 -t 11 -i source.mp4 -an -vf scale=1920:1080 -c:v libx264 -preset slow -crf 24 -maxrate 4M -bufsize 8M -pix_fmt yuv420p -movflags +faststart name.mp4
ffmpeg -ss 5.8 -t 11 -i source.mp4 -an -vf scale=1920:1080 -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 name.webm
ffmpeg -ss 1.5 -i name.mp4 -frames:v 1 -vf "scale='min(1280,iw)':-2" -c:v libwebp -quality 78 ../img/posters/name.webp
```

Для вертикального ролика со звуком уберите `-ss`/`-t`/`-an`/`-maxrate`, поставьте `-vf scale=1080:1920` и добавьте звук: `-c:a aac -b:a 160k` для MP4 и `-c:a libopus -b:a 128k` для WebM.

Новое имя нужно добавить в список видео в скрипте `window.__resources` в `<head>`.

## Мобильная версия

На экранах уже 760px двухколоночные блоки перестраиваются в одну колонку. Правила лежат в `@media (max-width: 760px)` в `<style>` внутри `<helmet>` и переопределяют инлайн-стили через `!important`. Размер карточек в блоке вертикальных видео на телефоне задаёт коэффициент `k4` в скрипте.
