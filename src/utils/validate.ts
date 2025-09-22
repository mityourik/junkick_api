import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createError } from '../middleware/error';

// Схемы валидации для аутентификации
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен')
});

// Схемы валидации для пользователей
export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное').optional(),
  skills: z.string().max(500, 'Навыки слишком длинные').optional(),
  bio: z.string().max(1000, 'Биография слишком длинная').optional(),
  experience: z.number().min(0, 'Опыт не может быть отрицательным').max(50, 'Опыт слишком большой').optional(),
  location: z.string().max(100, 'Локация слишком длинная').optional(),
  portfolio: z.string().max(500, 'Портфолио слишком длинное').optional(),
  role: z.enum(['admin', 'тимлид', 'заказчик', 'разработчик', 'дизайнер', 'тестировщик']).optional()
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(6, 'Новый пароль должен содержать минимум 6 символов')
});

// Схемы валидации для проектов
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(200, 'Название слишком длинное'),
  description: z.string().min(1, 'Описание обязательно').max(2000, 'Описание слишком длинное'),
  status: z.enum(['активный', 'завершен', 'приостановлен', 'в поиске команды']).optional(),
  lookingFor: z.string().min(1, 'Поле "Ищут" обязательно').max(500, 'Поле слишком длинное'),
  category: z.string().min(1, 'Категория обязательна'),
  tech: z.array(z.string()).min(1, 'Укажите хотя бы одну технологию'),
  neededRoles: z.array(z.string()).min(1, 'Укажите хотя бы одну роль'),
  teamSize: z.number().min(1, 'Размер команды должен быть минимум 1').max(50, 'Размер команды слишком большой'),
  budget: z.string().min(1, 'Бюджет обязателен').max(100, 'Бюджет слишком длинный'),
  timeline: z.string().min(1, 'Временные рамки обязательны').max(100, 'Временные рамки слишком длинные'),
  complexity: z.enum(['простой', 'средний', 'сложный']),
  image: z.string().url('Некорректная ссылка на изображение').max(500, 'Ссылка слишком длинная'),
  features: z.array(z.string().max(200, 'Функция слишком длинная')),
  requirements: z.array(z.string().max(200, 'Требование слишком длинное'))
});

export const projectUpdateSchema = projectCreateSchema.partial();

// Схемы валидации для заявок
export const applicationCreateSchema = z.object({
  projectId: z.string().min(1, 'ID проекта обязателен'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  role: z.string().min(1, 'Роль обязательна').max(50, 'Роль слишком длинная'),
  message: z.string().min(1, 'Сообщение обязательно').max(1000, 'Сообщение слишком длинное')
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum(['new', 'рассматривается', 'принято', 'отклонено'])
});

// Схемы валидации для фильтров
export const projectFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['активный', 'завершен', 'приостановлен', 'в поиске команды']).optional(),
  ownerId: z.string().optional(),
  neededRoles: z.string().optional(),
  tech: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Страница должна быть больше 0').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Лимит должен быть от 1 до 100').optional(),
  sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).optional()
});

// Схемы валидации для команды проекта
export const teamMemberSchema = z.object({
  userId: z.string().min(1, 'ID пользователя обязателен')
});

// Middleware для валидации тела запроса
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return next(createError(
          'Ошибка валидации данных',
          400,
          'VALIDATION_ERROR',
          validationErrors
        ));
      }
      next(error);
    }
  };
};

// Middleware для валидации query параметров
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return next(createError(
          'Ошибка валидации параметров запроса',
          400,
          'QUERY_VALIDATION_ERROR',
          validationErrors
        ));
      }
      next(error);
    }
  };
};

// Middleware для валидации параметров URL
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return next(createError(
          'Ошибка валидации параметров URL',
          400,
          'PARAMS_VALIDATION_ERROR',
          validationErrors
        ));
      }
      next(error);
    }
  };
};
