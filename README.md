# Ruslan Matuliak — портфолио

Статичный сайт-портфолио режиссёра и монтажёра Руслана Матуляка. Дизайн сделан в Claude Design и распакован в обычную структуру файлов: сборка и сервер не нужны.

## Структура

```
index.html            страница целиком: разметка, стили, логика анимаций
404.html              страница «не найдено»
robots.txt, _headers  служебные файлы для хостинга
assets/
  js/                 dc-runtime (движок Claude Design) + React 18
  fonts/              шрифты (только латиница)
  img/                фото (WebP), обложка для соцсетей og-cover.jpg
  img/posters/        превью-кадры видео
  icons/              favicon и иконка для iPhone
  video/              каждое видео в двух форматах: .mp4 (H.264) и .webm
```

Сайт сам выбирает формат видео: MP4 там, где браузер поддерживает H.264 (Safari, iPhone, Chrome, Edge), и WebM в остальных случаях.

## Посмотреть локально

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

Если открыть `index.html` двойным кликом (`file://`), видео и шрифты могут не загрузиться. Нужен именно локальный сервер.

## Публикация

Подойдёт любой статический хостинг. Бесплатные варианты:

- **Cloudflare Pages** или **Netlify**: подключить этот репозиторий, без команды сборки, папка публикации — корень репозитория. Файл `_headers` подхватится автоматически.
- **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root.
- **Vercel**: Import project, Framework preset: *Other*.

Затем подключить свой домен в настройках хостинга (HTTPS включится автоматически).

### После подключения домена

1. В `index.html` сделать ссылки на превью абсолютными: `og:image` и `twitter:image` → `https://ДОМЕН/assets/img/og-cover.jpg`. Добавить `<meta property="og:url" content="https://ДОМЕН/">` и `<link rel="canonical" href="https://ДОМЕН/">`. Telegram и Facebook не показывают картинку по относительной ссылке.
2. Создать `sitemap.xml` с адресом `https://ДОМЕН/` и добавить в `robots.txt` строку `Sitemap: https://ДОМЕН/sitemap.xml`.
3. Добавить сайт в Google Search Console и Яндекс Вебмастер.
4. Проверить превью ссылки: https://www.opengraph.xyz или отправить ссылку себе в Telegram.
5. По желанию подключить аналитику (Plausible, Umami или GA4): одна строка `<script>` в `<head>`.

## Как править контент

Весь текст находится в `index.html` внутри тега `<x-dc>`. Каждая секция помечена атрибутом `data-screen-label` («Hero», «01 Frog Invader», «02 Racks On Racks», «03 Night Parking», «04 Vertical Format Videos», «About»). Выражения в `{{ … }}` подставляются скриптом, их не трогать.

Ссылки на полные ролики на Vimeo задаются в `vimeo = { … }` в скрипте компонента (внизу `index.html`).

### Добавить или заменить видео

Короткие зацикленные превью лежат в `assets/video/`. Для нового ролика нужны оба формата и кадр-превью:

```bash
ffmpeg -i source.mov -vf scale=960:-2 -r 30 -c:v libx264 -crf 25 -pix_fmt yuv420p -movflags +faststart -an name.mp4
ffmpeg -i source.mov -vf scale=960:-2 -r 30 -c:v libvpx -b:v 1M -an name.webm
ffmpeg -ss 1.5 -i name.mp4 -frames:v 1 -c:v libwebp -quality 72 ../img/posters/name.webp
```

Новое имя нужно добавить в список видео в скрипте `window.__resources` в `<head>`.

## Мобильная версия

На экранах уже 760px двухколоночные блоки перестраиваются в одну колонку. Правила лежат в `@media (max-width: 760px)` в `<style>` внутри `<helmet>` и переопределяют инлайн-стили через `!important`. Размер карточек в блоке вертикальных видео на телефоне задаёт коэффициент `k4` в скрипте.
