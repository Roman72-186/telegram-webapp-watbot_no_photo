# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Описание проекта

Telegram Mini App для нутрициолога — сбор замеров тела без фото.
Пользователь открывает Web App из Telegram-бота, заполняет 7 числовых полей замеров,
и данные уходят через serverless API в Leadteh webhook.

## Стек технологий

- **Frontend:** HTML5, Tailwind CSS (CDN), vanilla JavaScript — без сборки, без npm
- **Backend:** Vercel Serverless Functions (Node.js) — `api/submit.js`
- **Деплой:** Vercel (автодеплой при push в main)
- **Интеграции:** Telegram Web App API, Leadteh CRM (webhook)
- **Репозиторий:** https://github.com/Roman72-186/telegram-webapp-data-collection

## Архитектура и поток данных

```
Telegram Bot → Кнопка "Web App" → index.html (форма замеров)
    → POST /api/submit (Vercel Function)
    → Leadteh webhook (CRM)
    → Ответ пользователю в браузере
```

- `telegram_id` получается через `Telegram.WebApp.initDataUnsafe.user.id`
- При отсутствии Telegram контекста (тестирование) используется `window.DEV_TELEGRAM_ID`
- API ищет контакт в Leadteh по `telegram_id` (пользователь должен сначала написать `/start` боту)
- Фото **не загружаются** — это версия "без фото"

## Ключевые моменты при разработке

- Язык интерфейса и комментариев — **русский**
- Нет `package.json` — проект не требует `npm install`
- Tailwind подключён через CDN, без сборки
- Тема адаптируется к Telegram (тёмная/светлая через CSS-переменные в `:root`)
- Webhook захардкожен в `api/submit.js`

## Интеграция с Leadteh

- **Webhook:** `https://rb729467.leadteh.ru/inner_webhook/4c77523d-3415-43d1-8668-07d35281cadb`
- **Поиск контакта:** по полю `telegram_id` (`contact_by: 'telegram_id'`)
- **Передаваемые переменные:** `weight`, `chest`, `navel`, `stomach`, `hips`, `legs`, `arms`, `telegram_id`, `source`, `ts`, `submission_date`
- **source:** `telegram-webapp-data-collection`

## Валидация формы

| HTML `id` / API поле | Метка               | Правило                  |
|----------------------|---------------------|--------------------------|
| `weight`             | Вес (кг)            | Число > 0, обязательное  |
| `chest`              | Обхват груди (см)   | Число > 0, обязательное  |
| `navel`              | Обхват по пупку (см)| Число > 0, обязательное  |
| `stomach`            | Обхват живота (см)  | Число > 0, обязательное  |
| `hips`               | Обхват бёдер (см)   | Число > 0, обязательное  |
| `legs`               | Обхват квадрицепс (см)| Число > 0, обязательное|
| `arms`               | Обхват бицепс (см)  | Число > 0, обязательное  |

Значения передаются в Leadteh как строки (`.value.trim()`), не числа.

## Деплой

```bash
# Git — коммит и пуш (триггерит автодеплой Vercel)
git add -A
git commit -m "Описание изменений"
git push origin main

# Vercel CLI (при необходимости ручного деплоя)
npm i -g vercel
vercel --prod
```
