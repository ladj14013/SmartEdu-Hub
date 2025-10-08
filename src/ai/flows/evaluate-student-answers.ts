'use server';

/**
 * @fileOverview Evaluates student answers using AI and provides instant feedback.
 *
 * - evaluateStudentAnswers - A function that evaluates student answers and provides feedback.
 * - EvaluateStudentAnswersInput - The input type for the evaluateStudentAnswers function.
 * - EvaluateStudentAnswersOutput - The return type for the evaluateStudentAnswers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateStudentAnswersInputSchema = z.object({
  lessonContent: z.string().describe('The content of the lesson.'),
  questions: z.array(z.string()).describe('The questions for the exercise.'),
  studentAnswers: z.array(z.string()).describe('The student answers to the questions.'),
  modelAnswers: z.array(z.string()).describe('The correct model answers for the questions.'),
});
export type EvaluateStudentAnswersInput = z.infer<typeof EvaluateStudentAnswersInputSchema>;

const EvaluateStudentAnswersOutputSchema = z.object({
  overallFeedback: z.string().describe('Overall feedback on the student performance.'),
  detailedFeedback: z.array(
    z.object({
      question: z.string().describe('The question that was asked.'),
      studentAnswer: z.string().describe('The student answer to the question.'),
      modelAnswer: z.string().describe('The correct model answer for the question.'),
      feedback: z.string().describe('Detailed feedback on the student answer based on the model answer.'),
      score: z.number().describe('A score from 0 to 10 representing how good the answer was, based on the model answer.'),
    })
  ).describe('Detailed feedback for each question and answer pair.'),
});
export type EvaluateStudentAnswersOutput = z.infer<typeof EvaluateStudentAnswersOutputSchema>;

export async function evaluateStudentAnswers(
  input: EvaluateStudentAnswersInput
): Promise<EvaluateStudentAnswersOutput> {
  return evaluateStudentAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateStudentAnswersPrompt',
  input: {schema: EvaluateStudentAnswersInputSchema},
  output: {schema: EvaluateStudentAnswersOutputSchema},
  prompt: `أنت مساعد ذكاء اصطناعي متخصص في تقييم إجابات التلاميذ. يجب أن تكون جميع ردودك باللغة العربية.
مهمتك هي مقارنة إجابة التلميذ بالإجابة النموذجية وتقديم ملاحظات بناءة ودرجة.

استخدم الإجابة النموذجية كمرجع أساسي لتقييم إجابة التلميذ.
قدم ملاحظات مفصلة لكل زوج من الأسئلة والإجابات، بما في ذلك درجة تمثل مدى جودة الإجابة (من 0 إلى 10).
قدم أيضًا ملاحظات عامة حول أداء التلميذ بشكل عام.

محتوى الدرس (للسياق): {{{lessonContent}}}

{{#each questions}}
  السؤال {{@index}}: {{{this}}}
  الإجابة النموذجية {{@index}}: {{{lookup ../modelAnswers @index}}}
  إجابة التلميذ {{@index}}: {{{lookup ../studentAnswers @index}}}
{{/each}}
`,
});

const evaluateStudentAnswersFlow = ai.defineFlow(
  {
    name: 'evaluateStudentAnswersFlow',
    inputSchema: EvaluateStudentAnswersInputSchema,
    outputSchema: EvaluateStudentAnswersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
