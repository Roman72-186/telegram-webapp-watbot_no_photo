# Интеграция «Сбор данных» Mini App с LEADTEX

Инструкция по получению Telegram ID пользователя и отправке замеров тела в LEADTEX.

---

## 1. Как Mini App получает Telegram ID

Когда пользователь открывает Mini App через Telegram бота, Telegram автоматически передаёт данные пользователя:

```javascript
const tg = window.Telegram?.WebApp;
const user = tg.initDataUnsafe?.user;
const telegram_id = user?.id;  // например: 123456789
```

**Telegram передаёт объект user:**
```javascript
{
    id: 123456789,           // Telegram ID пользователя
    first_name: "Иван",
    last_name: "Петров",
    username: "ivanpetrov",
    language_code: "ru"
}
```

---

## 2. Как данные отправляются в LEADTEX

При отправке формы Mini App делает POST-запрос на `/api/submit`, который проксирует данные в Leadteh webhook:

```javascript
// api/submit.js
const WEBHOOK_URL = 'https://rb729467.leadteh.ru/inner_webhook/0f32708a-4738-425e-903a-986db0842534';

const payloadToLeadteh = {
    contact_by: 'telegram_id',
    search: String(telegram_id),
    variables: {
        weight: 70.5,
        chest: 90,
        navel: 80,
        stomach: 85,
        hips: 95,
        legs: 55,
        arms: 30,
        photo_1: 'https://res.cloudinary.com/your-cloud/image/upload/v123/abc.jpg',
        photo_2: null,
        photo_3: null,
        telegram_id: 123456789,
        source: 'telegram-webapp-data-collection',
        ts: '2026-02-28T12:00:00.000Z',
        submission_date: '2026-02-28'
    }
};
```

---

## 3. Настройка LEADTEX

### Шаг 1: Регистрация контакта

Пользователь **должен сначала написать боту**, чтобы LEADTEX создал контакт с его `telegram_id`.

```
Пользователь → Пишет /start боту → LEADTEX создаёт контакт с telegram_id
```

### Шаг 2: Inner Webhook

- **Аккаунт:** rb257034.leadteh.ru
- **Webhook ID:** fe02b6a2-14d6-46c3-836f-5fb8292d0e4f
- **Полный URL:** `https://rb257034.leadteh.ru/inner_webhook/fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`

### Шаг 3: Сценарий обработки

В LEADTEX создайте сценарий:

```
Триггер: Inner Webhook (fe02b6a2-14d6-46c3-836f-5fb8292d0e4f)
    ↓
Действие: Обновить переменные контакта (замеры и фото)
    ↓
Действие: Отправить уведомление / тег / сообщение
```

---

## 4. Схема работы

```
┌───────────────────────────────────────────────────────┐
│  1. Пользователь открывает Mini App из Telegram бота  │
│     Telegram передаёт: { user: { id: 123456789 } }   │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────┐
│  2. Mini App (index.html)                             │
│     - Получает telegram_id                            │
│     - Пользователь заполняет замеры тела              │
│     - Опционально загружает фото (сжатие на клиенте)  │
│     - POST на /api/submit                             │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────┐
│  3. Vercel Serverless Function (api/submit.js)        │
│     - Валидирует 7 числовых полей замеров             │
│     - Загружает фото в Cloudinary → получает URL      │
│     - Перенаправляет данные (с URL фото) в LEADTEX    │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────┐
│  4. LEADTEX (rb257034.leadteh.ru)                     │
│     - Ищет контакт по telegram_id                     │
│     - Записывает замеры и фото в карточку             │
│     - Запускает сценарий                              │
└───────────────────────────────────────────────────────┘
```

---

## 5. Доступные переменные в LEADTEX

| Переменная | Описание | Пример |
|------------|----------|--------|
| `{{weight}}` | Вес (кг) | 70.5 |
| `{{chest}}` | Грудь (см) | 90 |
| `{{navel}}` | Пупок (см) | 80 |
| `{{stomach}}` | Живот (см) | 85 |
| `{{hips}}` | Бёдра (см) | 95 |
| `{{legs}}` | Ноги (см) | 55 |
| `{{arms}}` | Руки (см) | 30 |
| `{{photo_1}}` | Фото 1 | URL Cloudinary или null |
| `{{photo_2}}` | Фото 2 | URL Cloudinary или null |
| `{{photo_3}}` | Фото 3 | URL Cloudinary или null |
| `{{telegram_id}}` | Telegram ID | 123456789 |
| `{{source}}` | Источник | telegram-webapp-data-collection |
| `{{submission_date}}` | Дата отправки | 2026-02-28 |
| `{{ts}}` | Timestamp | ISO 8601 |

---

## 6. Отладка

### В консоли браузера (внутри Telegram)

```javascript
console.log(Telegram.WebApp.initDataUnsafe.user);
```

### Проверка API

```bash
curl -X POST https://YOUR-VERCEL-URL/api/submit \
  -H "Content-Type: application/json" \
  -d '{"weight":70.5,"chest":90,"navel":80,"stomach":85,"hips":95,"legs":55,"arms":30,"telegram_id":123456789}'
```
