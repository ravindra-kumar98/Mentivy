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

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { user, accessToken }
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

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: { user, accessToken }
            });
        } catch (error: any) {
            if (error.message === 'Invalid email or password') {
                res.status(401).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async refresh(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, message: 'Refresh token missing' });
                return;
            }

            const { user, accessToken, refreshToken: newRefreshToken } = await AuthService.verifyRefreshToken(refreshToken);

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                data: { user, accessToken }
            });
        } catch (error: any) {
            res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
}
