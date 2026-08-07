import bcrypt from 'bcryptjs';
import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';
import { UserModel } from '../../infrastructure/database/models/UserModel';

export class ProfileService {
    static async getProfile(userId: string) {
        const user = await UserModel.findById(userId).select('-passwordHash');
        const profile = await UserProfileModel.findOne({ userId });
        
        return {
            id: user?._id,
            fullName: user?.fullName || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
            role: user?.role || 'STUDENT',
            avatarUrl: user?.avatarUrl || '',
            targetExam: profile?.targetExam || 'Not set',
            targetYear: profile?.targetYear || 2026,
            dailyTimeAvailability: profile?.dailyTimeAvailability || 120,
            currentLevel: profile?.currentLevel || 'BEGINNER',
            preferredLanguage: profile?.preferredLanguage || 'English',
            hasPassword: !!user?.passwordHash
        };
    }

    static async updateProfile(userId: string, data: any) {
        // 1. Strict Server-side Validations
        const userUpdate: any = {};
        if (data.fullName !== undefined) {
            const trimmedName = String(data.fullName).trim();
            if (trimmedName.length < 2 || trimmedName.length > 50) {
                throw new Error('Full name must be between 2 and 50 characters.');
            }
            if (!/^[a-zA-Z][a-zA-Z\s._-]{1,49}$/.test(trimmedName)) {
                throw new Error('Full name must start with a letter and contain only letters, spaces, hyphens, or dots.');
            }
            userUpdate.fullName = trimmedName;
        }

        if (data.phoneNumber !== undefined) {
            const rawPhone = String(data.phoneNumber).replace(/^\+91\s*/, '').trim();
            if (rawPhone) {
                if (!/^[6-9]\d{9}$/.test(rawPhone)) {
                    throw new Error('Please enter a valid 10-digit Indian mobile number.');
                }
                userUpdate.phoneNumber = `+91 ${rawPhone}`;
            } else {
                userUpdate.phoneNumber = '';
            }
        }

        if (data.avatarUrl !== undefined) {
            if (typeof data.avatarUrl === 'string' && data.avatarUrl.length > 5000000) {
                throw new Error('Avatar image size is too large.');
            }
            userUpdate.avatarUrl = data.avatarUrl;
        }

        if (Object.keys(userUpdate).length > 0) {
            await UserModel.findByIdAndUpdate(userId, userUpdate, { new: true });
        }

        // 2. Update learning goals in UserProfileModel with bounds checking
        const profileUpdate: any = {};
        if (data.targetExam !== undefined) profileUpdate.targetExam = data.targetExam;
        if (data.targetYear !== undefined) {
            const year = Number(data.targetYear);
            if (isNaN(year) || year < 2026 || year > 2035) {
                throw new Error('Target exam year must be between 2026 and 2035.');
            }
            profileUpdate.targetYear = year;
        }
        if (data.dailyTimeAvailability !== undefined) {
            const daily = Number(data.dailyTimeAvailability);
            if (isNaN(daily) || daily < 30 || daily > 480) {
                throw new Error('Daily study goal must be between 30 and 480 minutes (8 hours).');
            }
            profileUpdate.dailyTimeAvailability = daily;
        }
        if (data.currentLevel !== undefined) profileUpdate.currentLevel = data.currentLevel;
        if (data.preferredLanguage !== undefined) profileUpdate.preferredLanguage = data.preferredLanguage;

        await UserProfileModel.findOneAndUpdate(
            { userId },
            profileUpdate,
            { upsert: true, new: true }
        );

        // Return updated consolidated profile
        return this.getProfile(userId);
    }

    static async changePassword(userId: string, data: any) {
        const { currentPassword, newPassword } = data;

        if (!currentPassword || !newPassword) {
            throw new Error('Current password and new password are required');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.passwordHash) {
            throw new Error('Password cannot be changed for accounts registered with Google Sign-In');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        // Validate password complexity
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }
        if (!/[A-Z]/.test(newPassword)) {
            throw new Error('New password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(newPassword)) {
            throw new Error('New password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(newPassword)) {
            throw new Error('New password must contain at least one number');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            throw new Error('New password must contain at least one special character');
        }

        // Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { success: true, message: 'Password changed successfully' };
    }

    static async deleteAccount(userId: string, confirmation: { password?: string; confirmEmail?: string }) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User account not found');
        }

        const pwd = (confirmation.password || '').trim();
        const emailConfirm = (confirmation.confirmEmail || '').trim().toLowerCase();

        // 1. Re-verify identity
        if (user.passwordHash) {
            // Password account: verify password or exact confirmed email
            if (pwd && pwd !== '$undefined') {
                const isMatch = await bcrypt.compare(pwd, user.passwordHash);
                if (!isMatch) {
                    throw new Error('Incorrect password. Please enter your valid account password.');
                }
            } else if (emailConfirm && emailConfirm === user.email.toLowerCase()) {
                // Email confirmation verified
            } else {
                throw new Error('Please enter your account password or type your exact email to confirm deletion.');
            }
        } else {
            // Google OAuth Account without password
            if (!emailConfirm || emailConfirm !== user.email.toLowerCase()) {
                throw new Error(`Please type your exact email address (${user.email}) to confirm deletion.`);
            }
        }

        // 2. Cascade atomic database cleanup
        await UserModel.findByIdAndDelete(userId);
        await UserProfileModel.deleteMany({ userId });

        return { 
            success: true, 
            message: 'Your account and all associated learning data have been permanently deleted.' 
        };
    }
}
