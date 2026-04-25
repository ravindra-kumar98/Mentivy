export interface User {
    id?: string;
    email: string;
    passwordHash: string;
    role: 'STUDENT' | 'ADMIN';
    phoneNumber?: string;
    avatarUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
