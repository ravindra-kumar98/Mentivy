/**
 * Seed Script: Populates Topics and Questions for development/testing.
 * Run with: npx ts-node src/scripts/seed.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { TopicModel } from '../infrastructure/database/models/TopicModel';
import { QuestionModel } from '../infrastructure/database/models/QuestionModel';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentivy';

const topicsData = [
    { subjectName: 'Quantitative Aptitude', name: 'Number System', weightage: 8 },
    { subjectName: 'Quantitative Aptitude', name: 'Percentage', weightage: 7 },
    { subjectName: 'Quantitative Aptitude', name: 'Simple & Compound Interest', weightage: 6 },
    { subjectName: 'General Awareness', name: 'Indian Polity', weightage: 7 },
    { subjectName: 'General Awareness', name: 'Medieval History', weightage: 5 },
    { subjectName: 'English', name: 'Reading Comprehension', weightage: 8 },
    { subjectName: 'English', name: 'Fill in the Blanks', weightage: 6 },
    { subjectName: 'Reasoning', name: 'Syllogisms', weightage: 7 },
    { subjectName: 'Reasoning', name: 'Blood Relations', weightage: 6 },
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await TopicModel.deleteMany({});
    await QuestionModel.deleteMany({});
    console.log('🗑️  Cleared existing Topics and Questions');

    // Insert Topics
    const topics = await TopicModel.insertMany(topicsData);
    console.log(`✅ Inserted ${topics.length} Topics`);

    // Build a lookup map: topic name → _id
    const topicMap: Record<string, string> = {};
    topics.forEach(t => { topicMap[t.name] = (t._id as mongoose.Types.ObjectId).toString(); });

    // --- Questions for Number System ---
    const numberSystemId = topicMap['Number System'];
    const questionsData = [
        {
            topicId: numberSystemId,
            difficulty: 1,
            content: 'Which of the following is NOT a prime number?',
            options: ['2', '7', '11', '15'],
            correctOptionIndex: 3,
            explanation: '15 = 3 × 5, so it is composite, not prime.',
            tags: ['prime', 'basics'],
        },
        {
            topicId: numberSystemId,
            difficulty: 2,
            content: 'The LCM of 12 and 18 is:',
            options: ['6', '36', '72', '24'],
            correctOptionIndex: 1,
            explanation: 'LCM(12, 18) = 36. Factors: 12 = 2²×3, 18 = 2×3². LCM = 2²×3² = 36.',
            tags: ['lcm', 'basics'],
        },
        {
            topicId: numberSystemId,
            difficulty: 3,
            content: 'What is the remainder when 2^10 is divided by 3?',
            options: ['0', '1', '2', '3'],
            correctOptionIndex: 1,
            explanation: '2^1=2, 2^2=4≡1 (mod 3). Pattern repeats every 2. 2^10 = (2^2)^5 ≡ 1^5 = 1 (mod 3).',
            tags: ['remainder', 'modular arithmetic'],
        },
        {
            topicId: numberSystemId,
            difficulty: 2,
            content: 'The sum of the first 20 natural numbers is:',
            options: ['190', '200', '210', '220'],
            correctOptionIndex: 2,
            explanation: 'Sum = n(n+1)/2 = 20×21/2 = 210.',
            tags: ['series', 'basics'],
        },

        // --- Percentage ---
        {
            topicId: topicMap['Percentage'],
            difficulty: 1,
            content: '25% of 200 is:',
            options: ['25', '40', '50', '75'],
            correctOptionIndex: 2,
            explanation: '25/100 × 200 = 50.',
            tags: ['percentage', 'basics'],
        },
        {
            topicId: topicMap['Percentage'],
            difficulty: 2,
            content: 'A number is increased by 20% and then decreased by 20%. The net change is:',
            options: ['No change', '4% decrease', '4% increase', '2% decrease'],
            correctOptionIndex: 1,
            explanation: 'Net = (1.2 × 0.8 - 1) × 100 = (0.96 - 1) × 100 = -4%. A 4% decrease.',
            tags: ['percentage', 'successive change'],
        },
        {
            topicId: topicMap['Percentage'],
            difficulty: 3,
            content: 'If A is 25% more than B, by what percent is B less than A?',
            options: ['20%', '25%', '22.5%', '15%'],
            correctOptionIndex: 0,
            explanation: 'A = 1.25B. B is less than A by (0.25B / 1.25B) × 100 = 20%.',
            tags: ['percentage', 'comparison'],
        },

        // --- Simple & Compound Interest ---
        {
            topicId: topicMap['Simple & Compound Interest'],
            difficulty: 2,
            content: 'Simple interest on ₹5,000 at 10% p.a. for 2 years is:',
            options: ['₹500', '₹750', '₹1,000', '₹1,250'],
            correctOptionIndex: 2,
            explanation: 'SI = P×R×T/100 = 5000×10×2/100 = ₹1,000.',
            tags: ['simple interest'],
        },
        {
            topicId: topicMap['Simple & Compound Interest'],
            difficulty: 3,
            content: 'The compound interest on ₹1,000 at 10% p.a. for 2 years (compounded annually) is:',
            options: ['₹200', '₹210', '₹220', '₹110'],
            correctOptionIndex: 1,
            explanation: 'A = 1000 × (1.1)² = 1210. CI = 1210 - 1000 = ₹210.',
            tags: ['compound interest'],
        },

        // --- Indian Polity ---
        {
            topicId: topicMap['Indian Polity'],
            difficulty: 1,
            content: 'The President of India is elected by:',
            options: [
                'Direct election by citizens',
                'Members of Parliament only',
                'Elected members of Parliament and State Legislatures',
                'Governors of all states',
            ],
            correctOptionIndex: 2,
            explanation: 'Article 54 of the Indian Constitution states the President is elected by an Electoral College consisting of elected members of both Houses of Parliament and elected members of all State Legislative Assemblies.',
            tags: ['president', 'election'],
        },
        {
            topicId: topicMap['Indian Polity'],
            difficulty: 2,
            content: 'Which article of the Indian Constitution deals with the Right to Equality?',
            options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'],
            correctOptionIndex: 1,
            explanation: 'Article 14 guarantees the right to equality before law and equal protection of laws to all persons.',
            tags: ['fundamental rights', 'articles'],
        },
        {
            topicId: topicMap['Indian Polity'],
            difficulty: 2,
            content: '"Zero Hour" in the Indian Parliament refers to:',
            options: [
                'The session held at midnight',
                'Time immediately after Question Hour for raising urgent matters',
                'Time reserved for private member bills',
                'Opening hour of Parliament',
            ],
            correctOptionIndex: 1,
            explanation: 'Zero Hour is the informal device that allows members of Parliament to raise matters of urgent public importance immediately after the Question Hour.',
            tags: ['parliament', 'procedures'],
        },

        // --- Syllogisms ---
        {
            topicId: topicMap['Syllogisms'],
            difficulty: 1,
            content: 'All cats are animals. All animals are living beings. Conclusion: All cats are living beings.',
            options: ['True', 'False', 'Partially True', 'Cannot be determined'],
            correctOptionIndex: 0,
            explanation: 'Standard syllogism: If A⊆B and B⊆C, then A⊆C. All cats are living beings is correct.',
            tags: ['syllogism', 'deduction'],
        },
        {
            topicId: topicMap['Syllogisms'],
            difficulty: 2,
            content: 'No dog is a cat. Some cats are birds. Conclusion: Some birds are not dogs.',
            options: ['Definitely True', 'Definitely False', 'Possibly True', 'Cannot be determined'],
            correctOptionIndex: 0,
            explanation: 'Since no dog is a cat and some cats are birds, those birds (which are cats) cannot be dogs. So some birds are definitely not dogs.',
            tags: ['syllogism', 'negative'],
        },

        // --- Blood Relations ---
        {
            topicId: topicMap['Blood Relations'],
            difficulty: 1,
            content: 'A is the brother of B. B is the sister of C. How is A related to C?',
            options: ['Sister', 'Brother', 'Uncle', 'Cannot be determined'],
            correctOptionIndex: 3,
            explanation: "We know A is male (brother), but C's gender is not specified. A is B's brother, and B is C's sister. A could be C's brother or we cannot determine if C is male or female without more info.",
            tags: ['blood relations', 'gender'],
        },
        {
            topicId: topicMap['Blood Relations'],
            difficulty: 2,
            content: 'Pointing to a photograph, a man says "The lady in the photo is my nephew\'s maternal grandmother." How is the lady related to the man\'s sister who has no other sibling?',
            options: ['Mother', 'Sister', 'Mother-in-law', 'Aunt'],
            correctOptionIndex: 0,
            explanation: "Man's nephew is the son of his sister (since she has no other sibling). The maternal grandmother of the nephew = mother of the man's sister = man's mother.",
            tags: ['blood relations', 'complex'],
        },
    ];

    const questions = await QuestionModel.insertMany(questionsData);
    console.log(`✅ Inserted ${questions.length} Questions across all topics`);

    console.log('\n📋 Topic Summary:');
    topics.forEach(t => {
        console.log(`  → [${t.subjectName}] ${t.name} (id: ${t._id})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete! Database disconnected.');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
