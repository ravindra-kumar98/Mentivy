import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { user, accessToken, refreshToken } = await AuthService.register(req.body);
            
            // Set HttpOnly Cookie for Refresh Token
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: { id: user._id, email: user.email, role: user.role },
                    accessToken
                }
            });
        } catch (error: any) {
            if (error.message === 'User already exists') {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { user, accessToken, refreshToken } = await AuthService.login(req.body);
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: { id: user._id, email: user.email, role: user.role },
                    accessToken
                }
            });
        } catch (error: any) {
            if (error.message === 'Invalid email or password') {
                res.status(401).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
