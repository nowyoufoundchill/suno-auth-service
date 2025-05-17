import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to verify API key
 */
export declare const verifyApiKey: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
