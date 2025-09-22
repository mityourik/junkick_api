import { Request, Response, NextFunction } from 'express';
import { Project, IProject } from '../models/Project.model';

// Расширяем интерфейс Request для добавления project
declare global {
  namespace Express {
    interface Request {
      project?: IProject;
    }
  }
}

// Проверка роли пользователя
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Требуется аутентификация',
          code: 'AUTHENTICATION_REQUIRED'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Недостаточно прав доступа',
          code: 'INSUFFICIENT_PERMISSIONS',
          details: `Требуемые роли: ${allowedRoles.join(', ')}`
        }
      });
    }

    next();
  };
};

// Проверка владения проектом
export const requireProjectOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Требуется аутентификация',
          code: 'AUTHENTICATION_REQUIRED'
        }
      });
    }

    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        error: {
          message: 'Проект не найден',
          code: 'PROJECT_NOT_FOUND'
        }
      });
    }

    // Админ имеет доступ ко всем проектам
    if (req.user.role === 'admin') {
      req.project = project;
      return next();
    }

    // Проверяем владение проектом
    if (project.ownerId.toString() !== (req.user._id as any).toString()) {
      return res.status(403).json({
        error: {
          message: 'Нет прав доступа к этому проекту',
          code: 'PROJECT_ACCESS_DENIED'
        }
      });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      error: {
        message: 'Ошибка проверки прав доступа',
        code: 'OWNERSHIP_CHECK_ERROR'
      }
    });
  }
};

// Проверка доступа к собственному профилю или админ
export const requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Требуется аутентификация',
        code: 'AUTHENTICATION_REQUIRED'
      }
    });
  }

  const userId = req.params.id;
  
  // Админ может редактировать любого пользователя
  if (req.user.role === 'admin') {
    return next();
  }

  // Пользователь может редактировать только свой профиль
  if ((req.user._id as any).toString() !== userId) {
    return res.status(403).json({
      error: {
        message: 'Нет прав доступа к этому профилю',
        code: 'PROFILE_ACCESS_DENIED'
      }
    });
  }

  next();
};

// Проверка ролей для создания проекта
export const requireProjectCreationRole = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Требуется аутентификация',
        code: 'AUTHENTICATION_REQUIRED'
      }
    });
  }

  const allowedRoles = ['тимлид', 'заказчик', 'admin'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: 'Только тимлиды и заказчики могут создавать проекты',
        code: 'PROJECT_CREATION_DENIED'
      }
    });
  }

  next();
};
