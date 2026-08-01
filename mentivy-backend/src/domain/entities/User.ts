export interface User {
    id?: string;
    fullName?: string;
    email: string;
    passwordHash?: string;
    role: 'STUDENT' | 'ADMIN';
    phoneNumber?: string;
    avatarUrl?: string;
    googleId?: string;
    isEmailVerified?: boolean;
    emailOtp?: string;
    emailOtpExpiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
