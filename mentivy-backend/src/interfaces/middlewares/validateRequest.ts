import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // console.log('Incoming Request Body:', JSON.stringify(req.body, null, 2));
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.error('Validation Error Details:', JSON.stringify(error.issues, null, 2));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
                });
                return;
            }
            res.status(500).json({ success: false, message: 'Internal validation error' });
        }
    };
