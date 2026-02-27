# Сбор данных — Telegram Web App (интеграция с Leadteh)

Данное веб-приложение представляет собой Telegram Web App для сбора данных пользователей с интеграцией в систему Leadteh.

## Описание

Проект позволяет пользователям заполнять форму через Telegram Web App с именем, фамилией и номером телефона. После отправки данные направляются в систему Leadteh через вебхук.

## Особенности

- Интеграция с Telegram Web App API
- Валидация данных формы
- Маска для ввода номера телефона
- Отправка данных в Leadteh с идентификацией по telegram_id
- Адаптивный дизайн

## Структура проекта

- `index.html` - основная страница с формой сбора данных
- `offer.html` - страница с офертой
- `privacy.html` - политика конфиденциальности
- `data-processing.html` - согласие на обработку персональных данных
- `api/submit.js` - серверная функция для обработки отправки формы и интеграции с Leadteh
- `vercel.json` - конфигурационный файл для Vercel
- `LEADTEX_INTEGRATION.md` - инструкция по интеграции с Leadteh
- `TESTING_INSTRUCTIONS.md` - инструкция по тестированию интеграции
- `PROJECT_GUIDE.md` - полное руководство по проекту

## Интеграция с Leadteh

Проект настроен на отправку данных в Leadteh по вебхуку:
`https://rb257034.leadteh.ru/inner_webhook/fe02b6a2-14d6-46c3-836f-5fb8292d0e4f`

Данные отправляются в формате:
```json
{
  "contact_by": "telegram_id",
  "search": "telegram_id_пользователя",
  "variables": {
    "customer_name": "Имя Фамилия",
    "customer_phone": "+7XXXXXXXXXX",
    "telegram_user_name": "Имя Фамилия",
    "telegram_id": "telegram_id_пользователя",
    "source": "telegram-webapp-data-collection",
    "ts": "timestamp",
    "first_name": "Имя",
    "last_name": "Фамилия",
    "registration_date": "YYYY-MM-DD",
    "registration_source": "telegram_mini_app"
  }
}
```

## Требования

- Пользователь должен сначала написать команду `/start` боту, чтобы его контакт был создан в Leadteh с соответствующим telegram_id
- После этого при заполнении формы через Web App система сможет сопоставить данные с существующим контактом

## Деплой

Проект готов для деплоя на Vercel. Каждый пуш в ветку main запускает автодеплой.

## Ссылки

- [GitHub](https://github.com/Roman72-186/telegram-webapp-data-collection)
- Vercel: *(будет добавлено после деплоя)*
