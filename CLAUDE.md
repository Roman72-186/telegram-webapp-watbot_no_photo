# Сбор данных — Telegram Web App

## Описание проекта

Telegram Mini App для нутрициолога — сбор замеров тела и фотографий прогресса.
Пользователь открывает Web App из Telegram-бота, заполняет 7 числовых полей замеров,
опционально загружает до 3 фото, и данные уходят через serverless API в Leadteh webhook.

## Стек технологий

- **Frontend:** HTML5, Tailwind CSS (CDN), vanilla JavaScript
- **Backend:** Vercel Serverless Functions (Node.js) — `api/submit.js`
- **Деплой:** Vercel (автодеплой при push в main)
- **Интеграции:** Telegram Web App API, Leadteh CRM (webhook)
- **Аккаунт Leadteh:** rb257034.leadteh.ru
- **Репозиторий:** https://github.com/Roman72-186/telegram-webapp-data-collection
- **Продакшн URL:** *(будет добавлено после деплоя на Vercel)*

## Структура проекта

```
├── index.html              — Основная страница с формой замеров тела
├── offer.html              — Страница оферты (не используется в форме)
├── privacy.html            — Политика конфиденциальности (не используется в форме)
├── data-processing.html    — Согласие на обработку данных (не используется в форме)
├── api/
│   └── submit.js           — Serverless API (валидация + отправка в Leadteh)
├── vercel.json             — Конфигурация Vercel
├── README.md               — Описание проекта
├── PROJECT_GUIDE.md        — Полное руководство
├── LEADTEX_INTEGRATION.md  — Документация интеграции с Leadteh
└── TESTING_INSTRUCTIONS.md — Инструкция по тестированию
```

## Архитектура и поток данных

```
Telegram Bot → Кнопка "Web App" → index.html (форма замеров)
    → POST /api/submit (Vercel Function)
    → Leadteh webhook (CRM)
    → Ответ пользователю
```

Telegram передаёт `telegram_id` через `Telegram.WebApp.initDataUnsafe.user.id`.
API ищет контакт в Leadteh по `telegram_id` и обновляет его данные.

**Важно:** Пользователь должен сначала написать `/start` боту — это создаёт контакт в Leadteh.

## Ключевые моменты при разработке

- Язык интерфейса и комментариев — **русский**
- 7 обязательных числовых полей замеров тела
- 3 опциональных поля загрузки фото (сжимаются на клиенте: max 800px, JPEG quality 0.6)
- Фото загружаются на сервере в Cloudinary, в Leadteh передаются URL-ссылки (не base64)
- Env-переменные Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET` (задаются в Vercel)
- Webhook: `https://rb257034.leadteh.ru/inner_webhook/fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`
- Webhook захардкожен в `api/submit.js`
- Tailwind подключён через CDN, без сборки
- Нет package.json — проект не требует `npm install`
- Тема адаптируется к Telegram (тёмная/светлая через CSS-переменные)
- source в payload: `telegram-webapp-data-collection`

## Валидация формы

| Поле      | Правило                        |
|-----------|-------------------------------|
| Вес (кг)  | Число > 0, обязательное       |
| Грудь (см)| Число > 0, обязательное       |
| Пупок (см)| Число > 0, обязательное       |
| Живот (см)| Число > 0, обязательное       |
| Бёдра (см)| Число > 0, обязательное       |
| Ноги (см) | Число > 0, обязательное       |
| Руки (см) | Число > 0, обязательное       |
| Фото 1    | Опциональное, base64 JPEG (загружается в Cloudinary) |
| Фото 2    | Опциональное, base64 JPEG (загружается в Cloudinary) |
| Фото 3    | Опциональное, base64 JPEG (загружается в Cloudinary) |

## Переменные Leadteh

`weight`, `chest`, `navel`, `stomach`, `hips`, `legs`, `arms`, `photo_1`, `photo_2`, `photo_3`, `telegram_id`, `source`, `ts`, `submission_date`

## Команды деплоя

### Git — коммит и пуш

```bash
git status
git add -A
git commit -m "Описание изменений"
git push origin main
```

### Vercel CLI

```bash
npm i -g vercel    # установка (однократно)
vercel             # preview деплой
vercel --prod      # продакшн деплой
```

## Тестирование

- Открыть Web App через Telegram-бота (проверить получение telegram_id)
- Проверить валидацию: пустые поля, нечисловые значения, отрицательные числа
- Проверить загрузку фото: превью отображается, сжатие работает
- Проверить отправку без фото (должна проходить)
- Проверить отправку с фото (URL из Cloudinary в payload к Leadteh)
- Проверить отображение в тёмной теме Telegram

## Cloudinary (хостинг фото)

- **Cloud Name:** `dchpd9kpb`
- **Upload Preset:** `sbor dannie` (Unsigned)
- **Env-переменные (Vercel):** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`
- **Тариф:** Free (25 credits/месяц)
- **Поток:** клиент отправляет base64 → `api/submit.js` загружает в Cloudinary → получает `secure_url` → передаёт URL в Leadteh
- **Настройки preset:** Auto-generate public ID, display name = last segment of public ID

## Интеграция с Leadteh

- **Аккаунт:** rb257034.leadteh.ru
- **Webhook:** `fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`
- **Поиск контакта:** по полю `telegram_id`
- **Передаваемые переменные:** weight, chest, navel, stomach, hips, legs, arms, photo_1, photo_2, photo_3, telegram_id, source, ts, submission_date
