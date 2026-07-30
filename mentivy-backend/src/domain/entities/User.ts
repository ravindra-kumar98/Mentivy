export interface User {
    id?: string;
    fullName?: string;
    email: string;
    passwordHash: string;
    role: 'STUDENT' | 'ADMIN';
    phoneNumber?: string;
    avatarUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
