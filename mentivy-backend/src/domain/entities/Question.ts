export interface Question {
    id?: string;
    topicId: string;
    difficulty: number; // 1 (easy) to 5 (very hard)
    content: string; // Markdown / HTML for math formulas
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
