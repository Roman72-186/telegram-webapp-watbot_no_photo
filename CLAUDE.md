# Сбор данных — Telegram Web App

## Описание проекта

Telegram Mini App для сбора данных пользователей и отправки в CRM-систему Leadteh.
Пользователь открывает Web App из Telegram-бота, заполняет форму,
соглашается с офертой/политикой, и данные уходят через serverless API в Leadteh webhook.

## Стек технологий

- **Frontend:** HTML5, Tailwind CSS (CDN), vanilla JavaScript, IMask.js
- **Backend:** Vercel Serverless Functions (Node.js) — `api/submit.js`
- **Деплой:** Vercel (автодеплой при push в main)
- **Интеграции:** Telegram Web App API, Leadteh CRM (webhook)
- **Аккаунт Leadteh:** rb257034.leadteh.ru
- **Репозиторий:** https://github.com/Roman72-186/telegram-webapp-data-collection
- **Продакшн URL:** *(будет добавлено после деплоя на Vercel)*

## Структура проекта

```
├── index.html              — Основная страница с формой сбора данных
├── offer.html              — Страница оферты
├── privacy.html            — Политика конфиденциальности
├── data-processing.html    — Согласие на обработку данных
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
Telegram Bot → Кнопка "Web App" → index.html (форма)
    → POST /api/submit (Vercel Function)
    → Leadteh webhook (CRM)
    → Ответ пользователю
```

Telegram передаёт `telegram_id` через `Telegram.WebApp.initDataUnsafe.user.id`.
API ищет контакт в Leadteh по `telegram_id` и обновляет его данные.

**Важно:** Пользователь должен сначала написать `/start` боту — это создаёт контакт в Leadteh.

## Ключевые моменты при разработке

- Язык интерфейса и комментариев — **русский**
- Телефон — только российский формат: `+7 (XXX) XXX-XX-XX`, отправляется как `+7XXXXXXXXXX`
- Форма требует заполнения всех полей + 3 чекбокса согласий
- Webhook: `https://rb257034.leadteh.ru/inner_webhook/fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`
- Webhook захардкожен в `api/submit.js` (строка 10)
- Tailwind подключён через CDN, без сборки
- Нет package.json — проект не требует `npm install`
- Тема адаптируется к Telegram (тёмная/светлая через CSS-переменные)
- source в payload: `telegram-webapp-data-collection`
- Документы (оферта, политика) открываются внутри Web App с кнопкой "Назад"

## Валидация формы

| Поле      | Правило                        |
|-----------|-------------------------------|
| Имя       | Минимум 2 символа              |
| Фамилия   | Минимум 2 символа              |
| Телефон   | Регулярка `/^\+7\d{10}$/`     |
| Чекбоксы  | Все 3 обязательны              |

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
- Проверить валидацию: пустые поля, короткие имена, невалидный телефон
- Проверить отправку формы и ответ от Leadteh
- Проверить отображение в тёмной теме Telegram
- Проверить открытие/закрытие документов (оферта, политика, обработка данных)

## Интеграция с Leadteh

- **Аккаунт:** rb257034.leadteh.ru
- **Webhook:** `fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`
- **Поиск контакта:** по полю `telegram_id`
- **Передаваемые переменные:** customer_name, customer_phone, telegram_user_name, telegram_id, first_name, last_name, source, registration_date, registration_source, ts
