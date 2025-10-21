import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createError } from '../middleware/error';

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен')
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  role: z.enum(['разработчик', 'тимлид', 'заказчик']).default('разработчик')
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное').optional(),
  skills: z.string().max(500, 'Навыки слишком длинные').optional(),
  bio: z.string().max(1000, 'Биография слишком длинная').optional(),
  experience: z.number().min(0, 'Опыт не может быть отрицательным').max(50, 'Опыт слишком большой').optional(),
  location: z.string().max(100, 'Локация слишком длинная').optional(),
  github_link: z.string().url('Некорректная ссылка на GitHub').max(500, 'Ссылка слишком длинная').optional(),
  role: z.enum(['разработчик', 'тимлид', 'заказчик']).optional()
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(6, 'Новый пароль должен содержать минимум 6 символов')
});

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

export const applicationCreateSchema = z.object({
  projectId: z.string().min(1, 'ID проекта обязателен'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  role: z.string().min(1, 'Роль обязательна').max(50, 'Роль слишком длинная'),
  message: z.string().min(1, 'Сообщение обязательно').max(1000, 'Сообщение слишком длинное')
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum(['new', 'рассматривается', 'принято', 'отклонено'])
});

export const projectFiltersSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  category: z.string().optional(),
  tech: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional()
});

export const teamMemberSchema = z.object({
  userId: z.string().min(1, 'ID пользователя обязателен')
});

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: {
            message: 'Ошибка валидации',
            code: 'VALIDATION_ERROR',
            details: errorMessages
          }
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: {
            message: 'Ошибка валидации параметров',
            code: 'VALIDATION_ERROR',
            details: errorMessages
          }
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: {
            message: 'Ошибка валидации query параметров',
            code: 'VALIDATION_ERROR',
            details: errorMessages
          }
        });
      }
      next(error);
    }
  };
};