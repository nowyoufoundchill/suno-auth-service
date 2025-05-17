import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to verify API key for service authentication
 */
export declare const apiKeyAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
