import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';
import { EmailService } from '../../infrastructure/services/EmailService';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
    static generateTokens(userId: string, role: string) {
        const accessToken = jwt.sign(
            { userId, role },
            process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId, role },
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    static generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async register(data: any) {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: data.email.toLowerCase() });
        if (existingUser) {
            if (existingUser.isEmailVerified) {
                throw new Error('User already exists');
            } else {
                // User exists but is unverified, regenerate OTP and update password/name
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(data.password, salt);
                const otp = this.generateOtp();
                const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

                existingUser.fullName = data.fullName || existingUser.fullName;
                existingUser.passwordHash = passwordHash;
                existingUser.phoneNumber = data.phoneNumber || existingUser.phoneNumber;
                existingUser.emailOtp = otp;
                existingUser.emailOtpExpiresAt = otpExpiresAt;
                await existingUser.save();

                await EmailService.sendOtpEmail(existingUser.email, existingUser.fullName || 'Student', otp);
                return { needsVerification: true, email: existingUser.email };
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create User Entity
        const user = await UserModel.create({
            fullName: data.fullName || data.email.split('@')[0],
            email: data.email.toLowerCase(),
            passwordHash,
            role: data.role || 'STUDENT',
            phoneNumber: data.phoneNumber,
            isEmailVerified: false,
            emailOtp: otp,
            emailOtpExpiresAt: otpExpiresAt
        });

        // Send Email Verification OTP
        await EmailService.sendOtpEmail(user.email, user.fullName || 'Student', otp);

        return { needsVerification: true, email: user.email };
    }

    static async verifyEmail(email: string, otp: string) {
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error('User account not found');
        }

        if (user.isEmailVerified) {
            // Already verified
            const profile = await UserProfileModel.findOne({ userId: user._id.toString() });
            const needsOnboarding = !profile || profile.targetExam === 'UNKNOWN' || profile.targetExam === 'Not set';
            const tokens = this.generateTokens(user._id.toString(), user.role);
            return {
                user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, needsOnboarding },
                ...tokens
            };
        }

        if (!user.emailOtp || user.emailOtp !== otp.trim()) {
            throw new Error('Invalid 6-digit verification code');
        }

        if (user.emailOtpExpiresAt && user.emailOtpExpiresAt < new Date()) {
            throw new Error('Verification code has expired. Please request a new one.');
        }

        // Mark as verified
        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiresAt = undefined;
        await user.save();

        // Create UserProfile mapping if not present
        let profile = await UserProfileModel.findOne({ userId: user._id.toString() });
        if (!profile) {
            profile = await UserProfileModel.create({
                userId: user._id.toString(),
                targetExam: 'UNKNOWN',
                targetYear: 2026,
                dailyTimeAvailability: 120,
                currentLevel: 'BEGINNER',
                preferredLanguage: 'English'
            });
        }

        const needsOnboarding = !profile || profile.targetExam === 'UNKNOWN' || profile.targetExam === 'Not set';
        const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);

        return {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                needsOnboarding
            },
            accessToken,
            refreshToken
        };
    }

    static async resendOtp(email: string) {
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error('User not found');
        }

        if (user.isEmailVerified) {
            throw new Error('Email is already verified');
        }

        const otp = this.generateOtp();
        user.emailOtp = otp;
        user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await EmailService.sendOtpEmail(user.email, user.fullName || 'Student', otp);
        return { success: true, email: user.email };
    }

    static async login(data: any) {
        const user = await UserModel.findOne({ email: data.email.toLowerCase() });
        if (!user || !user.passwordHash) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        if (!user.isEmailVerified) {
            // Send new OTP and notify frontend to open verification modal
            const otp = this.generateOtp();
            user.emailOtp = otp;
            user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await EmailService.sendOtpEmail(user.email, user.fullName || 'Student', otp);

            return { needsVerification: true, email: user.email };
        }

        const profile = await UserProfileModel.findOne({ userId: user._id.toString() });
        const needsOnboarding = !profile || profile.targetExam === 'UNKNOWN' || profile.targetExam === 'Not set';

        const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);
        return { 
            user: { 
                id: user._id, 
                fullName: user.fullName,
                email: user.email, 
                role: user.role,
                needsOnboarding 
            }, 
            accessToken, 
            refreshToken 
        };
    }

    static async googleAuth(credential: string) {
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (err) {
            // Fallback for decoding base64 JWT payload if client ID is local/test
            try {
                const parts = credential.split('.');
                payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            } catch (e) {
                throw new Error('Invalid Google credential');
            }
        }

        if (!payload || !payload.email) {
            throw new Error('Could not retrieve email from Google account');
        }

        const email = payload.email.toLowerCase();
        const fullName = payload.name || payload.given_name || email.split('@')[0];
        const avatarUrl = payload.picture;
        const googleId = payload.sub;

        let user = await UserModel.findOne({ email });

        if (!user) {
            // Create user auto-verified via Google
            user = await UserModel.create({
                fullName,
                email,
                avatarUrl,
                googleId,
                role: 'STUDENT',
                isEmailVerified: true
            });
        } else {
            // User exists - link Google ID & set verified
            user.googleId = googleId;
            user.isEmailVerified = true;
            if (avatarUrl) user.avatarUrl = avatarUrl;
            await user.save();
        }

        // Create profile mapping if missing
        let profile = await UserProfileModel.findOne({ userId: user._id.toString() });
        if (!profile) {
            profile = await UserProfileModel.create({
                userId: user._id.toString(),
                targetExam: 'UNKNOWN',
                targetYear: 2026,
                dailyTimeAvailability: 120,
                currentLevel: 'BEGINNER',
                preferredLanguage: 'English'
            });
        }

        const needsOnboarding = !profile || profile.targetExam === 'UNKNOWN' || profile.targetExam === 'Not set';
        const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);

        return {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                needsOnboarding
            },
            accessToken,
            refreshToken
        };
    }

    static async verifyRefreshToken(token: string) {
        try {
            const decoded = jwt.verify(
                token, 
                process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
            ) as { userId: string };
            
            const user = await UserModel.findById(decoded.userId);
            if (!user) throw new Error('User not found');

            const profile = await UserProfileModel.findOne({ userId: user._id.toString() });
            const needsOnboarding = !profile || profile.targetExam === 'UNKNOWN' || profile.targetExam === 'Not set';

            const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);
            return { 
                user: { 
                    id: user._id, 
                    fullName: user.fullName,
                    email: user.email, 
                    role: user.role,
                    needsOnboarding 
                }, 
                accessToken, 
                refreshToken 
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}
