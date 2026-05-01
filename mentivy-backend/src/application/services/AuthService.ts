import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';

export class AuthService {
    static generateTokens(userId: string, role: string) {
        const accessToken = jwt.sign(
            { userId, role },
            process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    static async register(data: any) {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Create User Entity
        const user = await UserModel.create({
            email: data.email,
            passwordHash,
            role: data.role || 'STUDENT',
            phoneNumber: data.phoneNumber
        });

        // Create UserProfile mapping
        await UserProfileModel.create({
            userId: user._id.toString(),
            targetExam: data.targetExam || 'UNKNOWN',
            dailyTimeAvailability: data.dailyTimeAvailability || 120,
            currentLevel: data.currentLevel || 'BEGINNER'
        });

        const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);
        return { user, accessToken, refreshToken };
    }

    static async login(data: any) {
        const user = await UserModel.findOne({ email: data.email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);
        return { user, accessToken, refreshToken };
    }

    static async verifyRefreshToken(token: string) {
        try {
            const decoded = jwt.verify(
                token, 
                process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
            ) as { userId: string };
            
            const user = await UserModel.findById(decoded.userId);
            if (!user) throw new Error('User not found');

            const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.role);
            return { user, accessToken, refreshToken };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}
