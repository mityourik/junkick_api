import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const createError = (message: string, statusCode: number = 500, code?: string, details?: any): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

// Централизованный обработчик ошибок
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🚨 Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // Валидационные ошибки Mongoose
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));

    return res.status(400).json({
      error: {
        message: 'Ошибка валидации данных',
        code: 'VALIDATION_ERROR',
        details: validationErrors
      }
    });
  }

  // Ошибки дублирования (unique constraint)
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return res.status(409).json({
      error: {
        message: `Поле ${field} должно быть уникальным`,
        code: 'DUPLICATE_ERROR',
        details: { field }
      }
    });
  }

  // Ошибки ObjectId
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: {
        message: 'Неверный формат ID',
        code: 'INVALID_ID'
      }
    });
  }

  // Стандартная обработка ошибок
  res.status(statusCode).json({
    error: {
      message: error.message || 'Внутренняя ошибка сервера',
      code,
      ...(error.details && { details: error.details })
    }
  });
};

// Middleware для обработки 404 ошибок
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(
    `Маршрут ${req.method} ${req.url} не найден`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Async wrapper для автоматической обработки ошибок в async функциях
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
