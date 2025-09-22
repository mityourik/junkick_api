import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import connectDB from './db/mongoose';
import { errorHandler, notFoundHandler } from './middleware/error';

// Импорт маршрутов
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import projectsRoutes from './routes/projects.routes';
import applicationsRoutes from './routes/applications.routes';
import dictionariesRoutes from './routes/dictionaries.routes';

const app = express();

// Подключение к базе данных
connectDB();

// Безопасность
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: {
      message: 'Слишком много запросов, попробуйте позже',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// Применяем rate limiting ко всем маршрутам
app.use(limiter);

// Логирование
app.use(morgan('combined'));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api', dictionariesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Обработка 404
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Окружение: ${config.nodeEnv}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
