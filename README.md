# Junkick API

API для проекта Junkick - платформы для поиска команды и проектов.

## Технологии

- **Node.js + Express** - веб-сервер
- **MongoDB Atlas + Mongoose** - база данных
- **JWT** - аутентификация (access токен)
- **bcrypt** - хэширование паролей
- **Zod** - валидация данных
- **Morgan** - логирование запросов
- **Helmet** - безопасность
- **CORS** - настройка CORS
- **express-rate-limit** - ограничение запросов

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

3. Настройте переменные окружения в `.env`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

4. Запустите в режиме разработки:
```bash
npm run dev
```

5. Для продакшена:
```bash
npm run build
npm start
```

## Миграция данных

Для импорта данных из `db.json` в MongoDB:

```bash
npm run migrate
```

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - вход в систему
- `POST /api/auth/logout` - выход из системы
- `GET /api/auth/me` - получение текущего пользователя

### Пользователи
- `GET /api/users/:id` - получение пользователя
- `PATCH /api/users/:id` - обновление профиля

### Проекты
- `GET /api/projects` - список проектов (с фильтрами)
- `GET /api/projects/:id` - получение проекта
- `POST /api/projects` - создание проекта
- `PATCH /api/projects/:id` - обновление проекта
- `DELETE /api/projects/:id` - удаление проекта
- `POST /api/projects/:id/team` - добавление участника
- `DELETE /api/projects/:id/team/:userId` - удаление участника

### Заявки
- `POST /api/applications` - подача заявки
- `GET /api/projects/:id/applications` - заявки на проект
- `PATCH /api/applications/:id` - изменение статуса заявки
- `GET /api/applications` - заявки пользователя

### Словари
- `GET /api/roles` - список ролей
- `GET /api/technologies` - список технологий
- `GET /api/categories` - список категорий

## Структура проекта

```
src/
├── config.ts              # Конфигурация
├── server.ts              # Главный файл сервера
├── db/
│   └── mongoose.ts        # Подключение к MongoDB
├── models/                # Mongoose модели
├── middleware/            # Middleware
├── routes/                # Маршруты
├── controllers/           # Контроллеры
├── services/              # Бизнес-логика
└── utils/                 # Утилиты
```

## Health Check

```bash
GET /health
```

Возвращает статус сервера и время работы.
