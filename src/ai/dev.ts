import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-lesson-content.ts';
import '@/ai/flows/evaluate-student-answers.ts';
import '@/ai/flows/get-teacher-by-code.ts';
