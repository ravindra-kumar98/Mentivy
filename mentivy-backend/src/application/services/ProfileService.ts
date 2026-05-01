import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';
import { UserModel } from '../../infrastructure/database/models/UserModel';

export class ProfileService {
    static async getProfile(userId: string) {
        const user = await UserModel.findById(userId).select('-passwordHash');
        const profile = await UserProfileModel.findOne({ userId });
        
        return {
            email: user?.email,
            role: user?.role,
            targetExam: profile?.targetExam || 'Not set',
            dailyTimeAvailability: profile?.dailyTimeAvailability || 120,
            currentLevel: profile?.currentLevel || 'BEGINNER'
        };
    }

    static async updateProfile(userId: string, data: any) {
        const profile = await UserProfileModel.findOneAndUpdate(
            { userId },
            { 
                targetExam: data.targetExam,
                dailyTimeAvailability: data.dailyTimeAvailability,
                currentLevel: data.currentLevel
            },
            { upsert: true, new: true }
        );
        return profile;
    }
}
