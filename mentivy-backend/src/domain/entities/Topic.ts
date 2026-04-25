export interface Topic {
    id?: string;
    subjectName: string;
    name: string;
    weightage: number; // 1 to 10 scale of importance for the exam
    createdAt?: Date;
    updatedAt?: Date;
}
