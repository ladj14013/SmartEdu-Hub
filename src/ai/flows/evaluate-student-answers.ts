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
});
export type EvaluateStudentAnswersInput = z.infer<typeof EvaluateStudentAnswersInputSchema>;

const EvaluateStudentAnswersOutputSchema = z.object({
  overallFeedback: z.string().describe('Overall feedback on the student performance.'),
  detailedFeedback: z.array(
    z.object({
      question: z.string().describe('The question that was asked.'),
      studentAnswer: z.string().describe('The student answer to the question.'),
      feedback: z.string().describe('Detailed feedback on the student answer.'),
      score: z.number().describe('A score representing how good the answer was.'),
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
  prompt: `أنت مساعد ذكاء اصطناعي متخصص في تقييم إجابات التلاميذ على التمارين. يجب أن تكون جميع ردودك باللغة العربية.

  قدم ملاحظات مفصلة لكل زوج من الأسئلة والإجابات، بما في ذلك درجة تمثل مدى جودة الإجابة (من 0 إلى 10).
  قدم أيضًا ملاحظات عامة حول أداء التلميذ بشكل عام.

  محتوى الدرس: {{{lessonContent}}}
  الأسئلة: {{#each questions}}{{{this}}}\n{{/each}}
  إجابات التلميذ: {{#each studentAnswers}}{{{this}}}\n{{/each}}

  الرجاء تقديم الرد بتنسيق JSON التالي:
  {
    "overallFeedback": "ملاحظات عامة حول أداء التلميذ.",
    "detailedFeedback": [
      {
        "question": "السؤال الذي تم طرحه.",
        "studentAnswer": "إجابة التلميذ على السؤال.",
        "feedback": "ملاحظات مفصلة حول إجابة التلميذ.",
        "score": "درجة تمثل مدى جودة الإجابة (من 0 إلى 10)."
      }
    ]
  }`,
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
