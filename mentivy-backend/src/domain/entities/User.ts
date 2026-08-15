export interface User {
    id?: string;
    fullName?: string;
    email: string;
    passwordHash?: string;
    role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
    assignedFields?: string[];
    phoneNumber?: string;
    avatarUrl?: string;
    googleId?: string;
    isEmailVerified?: boolean;
    emailOtp?: string;
    emailOtpExpiresAt?: Date;
    resetPasswordOtp?: string;
    resetPasswordOtpExpiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
