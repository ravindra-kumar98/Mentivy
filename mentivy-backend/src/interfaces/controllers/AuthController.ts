import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const result = await AuthService.register(req.body);
            res.status(200).json({
                success: true,
                message: 'Verification OTP sent to email',
                data: result
            });
        } catch (error: any) {
            if (error.message === 'User already exists') {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required' });
                return;
            }

            const { user, accessToken, refreshToken } = await AuthService.verifyEmail(email, otp);

            // Set HttpOnly Cookie for Refresh Token
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                data: { user, accessToken }
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, message: 'Email is required' });
                return;
            }

            const result = await AuthService.resendOtp(email);
            res.status(200).json({
                success: true,
                message: 'Verification code resent successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const result = await AuthService.login(req.body);

            if ((result as any).needsVerification) {
                res.status(200).json({
                    success: true,
                    message: 'Email verification required',
                    data: result
                });
                return;
            }

            const { user, accessToken, refreshToken } = result as any;
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
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

    static async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;
            if (!credential) {
                res.status(400).json({ success: false, message: 'Google credential token is required' });
                return;
            }

            const { user, accessToken, refreshToken } = await AuthService.googleAuth(credential);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                message: 'Google authentication successful',
                data: { user, accessToken }
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
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
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.cookie('needsOnboarding', (user as any).needsOnboarding.toString(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/',
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
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as any,
            path: '/',
        };
        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('needsOnboarding', { ...cookieOptions, httpOnly: false });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
}
