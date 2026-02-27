# Сбор данных — Telegram Web App (интеграция с Leadteh)

Данное веб-приложение представляет собой Telegram Web App для сбора замеров тела и фотографий прогресса с интеграцией в систему Leadteh.

## Описание

Проект для нутрициолога — позволяет пользователям отправлять замеры тела (вес, грудь, пупок, живот, бёдра, ноги, руки) и до 3 фотографий прогресса через Telegram Web App. После отправки данные направляются в систему Leadteh через вебхук.

## Особенности

- Интеграция с Telegram Web App API
- 7 числовых полей замеров тела с валидацией
- 3 опциональных поля загрузки фото с превью
- Сжатие фото на клиенте (canvas → JPEG, max 800px, quality 0.6)
- Загрузка фото в Cloudinary на сервере, передача URL в Leadteh
- Отправка данных в Leadteh с идентификацией по telegram_id
- Адаптивный дизайн

## Структура проекта

- `index.html` — основная страница с формой замеров тела
- `offer.html` — страница с офертой
- `privacy.html` — политика конфиденциальности
- `data-processing.html` — согласие на обработку персональных данных
- `api/submit.js` — серверная функция для обработки отправки формы и интеграции с Leadteh
- `vercel.json` — конфигурационный файл для Vercel
- `LEADTEX_INTEGRATION.md` — инструкция по интеграции с Leadteh
- `TESTING_INSTRUCTIONS.md` — инструкция по тестированию интеграции
- `PROJECT_GUIDE.md` — полное руководство по проекту

## Интеграция с Leadteh

Проект настроен на отправку данных в Leadteh по вебхуку:
`https://rb257034.leadteh.ru/inner_webhook/fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`

Данные отправляются в формате:
```json
{
  "contact_by": "telegram_id",
  "search": "telegram_id_пользователя",
  "variables": {
    "weight": 70.5,
    "chest": 90,
    "navel": 80,
    "stomach": 85,
    "hips": 95,
    "legs": 55,
    "arms": 30,
    "photo_1": "https://res.cloudinary.com/your-cloud/image/upload/v123/abc.jpg",
    "photo_2": null,
    "photo_3": null,
    "telegram_id": "telegram_id_пользователя",
    "source": "telegram-webapp-data-collection",
    "ts": "2026-02-28T12:00:00.000Z",
    "submission_date": "2026-02-28"
  }
}
```

## Требования

- Пользователь должен сначала написать команду `/start` боту, чтобы его контакт был создан в Leadteh с соответствующим telegram_id
- После этого при заполнении формы через Web App система сможет сопоставить данные с существующим контактом

## Деплой

Проект готов для деплоя на Vercel. Каждый пуш в ветку main запускает автодеплой.

### Настройка Cloudinary (хостинг фото)

Фото загружаются в Cloudinary на сервере, в Leadteh передаются короткие URL-ссылки.
Cloudinary бесплатен (Free tier: 25 credits/месяц — хватит с запасом).

#### Шаг 1: Регистрация

1. Зарегистрируйтесь на [cloudinary.com](https://cloudinary.com)
2. На главной странице Dashboard найдите **Cloud Name** (например `dchpd9kpb`)

#### Шаг 2: Создание Upload Preset

1. Перейдите в **Settings → Upload → Upload Presets**
2. Нажмите **Add upload preset**
3. Настройте:
   - **Preset name:** любое имя (например `sbor dannie`)
   - **Signing Mode:** **Unsigned**
4. В разделе **Generated public ID:**
   - Выберите **Auto-generate an unguessable public ID value**
5. В разделе **Generated display name:**
   - Выберите **Use the last segment of the public ID as the display Name**
6. Остальные настройки оставьте по умолчанию
7. Нажмите **Save**

#### Шаг 3: Environment Variables в Vercel

В **Vercel** → ваш проект → **Settings** → **Environment Variables** добавьте:

| Переменная | Значение | Описание |
|-----------|----------|----------|
| `CLOUDINARY_CLOUD_NAME` | `dchpd9kpb` | Cloud Name из Cloudinary Dashboard |
| `CLOUDINARY_UPLOAD_PRESET` | `sbor dannie` | Имя созданного Upload Preset |

Выберите окружения: **Production**, **Preview**, **Development**.

#### Как это работает

```
Клиент (index.html)              Сервер (api/submit.js)           Cloudinary
─────────────────────────────────────────────────────────────────────────────
Сжатие фото на клиенте    →  Получает base64            →  Загрузка фото
(canvas, max 800px,           Отправляет в Cloudinary       Возврат URL
JPEG quality 0.6)             Получает secure_url
                              Передаёт URL в Leadteh
```

## Ссылки

- [GitHub](https://github.com/Roman72-186/telegram-webapp-data-collection)
- Vercel: *(будет добавлено после деплоя)*
