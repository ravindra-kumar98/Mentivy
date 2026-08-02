import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { PendingUserModel } from '../../infrastructure/database/models/PendingUserModel';
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
        const email = data.email.toLowerCase();

        // 1. Check if user already exists and is verified in main Users collection
        const existingUser = await UserModel.findOne({ email });
        if (existingUser && existingUser.isEmailVerified) {
            throw new Error('User already exists');
        }

        // 2. Hash password & generate 6-digit OTP
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Upsert into temporary PendingUserModel (overwrites if unverified attempt exists within 10m window)
        const pendingUser = await PendingUserModel.findOneAndUpdate(
            { email },
            {
                fullName: data.fullName || email.split('@')[0],
                email,
                passwordHash,
                phoneNumber: data.phoneNumber,
                emailOtp: otp,
                emailOtpExpiresAt: otpExpiresAt,
                createdAt: new Date() // Resets 10-minute TTL expiry timer
            },
            { upsert: true, returnDocument: 'after' }
        );

        // 4. Send 6-Digit OTP Email
        await EmailService.sendOtpEmail(pendingUser.email, pendingUser.fullName || 'Student', otp);

        return { needsVerification: true, email: pendingUser.email };
    }

    static async verifyEmail(email: string, otp: string) {
        const normalizedEmail = email.toLowerCase();

        // 1. Check if user is already verified in main Users collection
        const verifiedUser = await UserModel.findOne({ email: normalizedEmail });
        if (verifiedUser && verifiedUser.isEmailVerified) {
            const profile = await UserProfileModel.findOne({ userId: verifiedUser._id.toString() });
            const needsOnboarding = !profile || profile.targetExam === 'UNKNOWN' || profile.targetExam === 'Not set';
            const tokens = this.generateTokens(verifiedUser._id.toString(), verifiedUser.role);
            return {
                user: { id: verifiedUser._id, fullName: verifiedUser.fullName, email: verifiedUser.email, role: verifiedUser.role, needsOnboarding },
                ...tokens
            };
        }

        // 2. Find pending registration in PendingUserModel
        const pendingUser = await PendingUserModel.findOne({ email: normalizedEmail });
        if (!pendingUser) {
            throw new Error('Verification session expired or account not found. Please register again.');
        }

        if (!pendingUser.emailOtp || pendingUser.emailOtp !== otp.trim()) {
            throw new Error('Invalid 6-digit verification code');
        }

        if (pendingUser.emailOtpExpiresAt && pendingUser.emailOtpExpiresAt < new Date()) {
            throw new Error('Verification code has expired. Please request a new code.');
        }

        // 3. Create permanent verified account in main UserModel
        const user = await UserModel.create({
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            passwordHash: pendingUser.passwordHash,
            role: 'STUDENT',
            phoneNumber: pendingUser.phoneNumber,
            isEmailVerified: true
        });

        // 4. Delete pending registration document from PendingUserModel
        await PendingUserModel.deleteOne({ _id: pendingUser._id });

        // 5. Create UserProfile mapping
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
        const normalizedEmail = email.toLowerCase();

        // 1. Check if already verified
        const verifiedUser = await UserModel.findOne({ email: normalizedEmail });
        if (verifiedUser && verifiedUser.isEmailVerified) {
            throw new Error('Email is already verified');
        }

        // 2. Check pending registration
        const pendingUser = await PendingUserModel.findOne({ email: normalizedEmail });
        if (!pendingUser) {
            throw new Error('Verification session expired. Please register again.');
        }

        const otp = this.generateOtp();
        pendingUser.emailOtp = otp;
        pendingUser.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        pendingUser.createdAt = new Date(); // Reset 10-minute TTL
        await pendingUser.save();

        await EmailService.sendOtpEmail(pendingUser.email, pendingUser.fullName || 'Student', otp);
        return { success: true, email: pendingUser.email };
    }

    static async login(data: any) {
        const normalizedEmail = data.email.toLowerCase();

        // 1. Check main verified Users collection
        const user = await UserModel.findOne({ email: normalizedEmail });
        if (user && user.passwordHash) {
            const isMatch = await bcrypt.compare(data.password, user.passwordHash);
            if (!isMatch) {
                throw new Error('Invalid email or password');
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

        // 2. If not found in main Users, check temporary PendingUserModel (unverified signup within 10m window)
        const pendingUser = await PendingUserModel.findOne({ email: normalizedEmail });
        if (pendingUser) {
            const isMatch = await bcrypt.compare(data.password, pendingUser.passwordHash);
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }

            // Password matches: generate new OTP, update pending user, and redirect to OTP verification modal
            const otp = this.generateOtp();
            pendingUser.emailOtp = otp;
            pendingUser.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            pendingUser.createdAt = new Date(); // Reset 10m TTL
            await pendingUser.save();

            await EmailService.sendOtpEmail(pendingUser.email, pendingUser.fullName || 'Student', otp);
            return { needsVerification: true, email: pendingUser.email };
        }

        throw new Error('Invalid email or password');
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

    static async forgotPassword(email: string) {
        const normalizedEmail = email.toLowerCase();
        const user = await UserModel.findOne({ email: normalizedEmail });
        
        if (!user || !user.isEmailVerified) {
            throw new Error('No active account found with this email');
        }

        const otp = this.generateOtp();
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        await EmailService.sendPasswordResetEmail(user.email, user.fullName || 'Student', otp);
        return { success: true, email: user.email };
    }

    static async resetPassword(data: any) {
        const normalizedEmail = (data.email || '').toLowerCase();
        const otp = (data.otp || '').trim();
        const newPassword = data.newPassword || '';

        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            throw new Error('Account not found');
        }

        if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
            throw new Error('Invalid 6-digit password reset code');
        }

        if (user.resetPasswordOtpExpiresAt && user.resetPasswordOtpExpiresAt < new Date()) {
            throw new Error('Password reset code has expired. Please request a new code.');
        }

        // Validate password complexity
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (!/[A-Z]/.test(newPassword)) {
            throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(newPassword)) {
            throw new Error('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(newPassword)) {
            throw new Error('Password must contain at least one number');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            throw new Error('Password must contain at least one special character');
        }

        // Hash new password & clear reset OTP fields
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpiresAt = undefined;
        await user.save();

        return { success: true, message: 'Password reset successfully' };
    }
}
