import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
