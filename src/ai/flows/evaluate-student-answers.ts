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
  prompt: `You are an AI assistant that evaluates student answers to exercises.

  Provide detailed feedback for each question and answer pair, including a score representing how good the answer was.
  Also provide overall feedback on the student performance.

  Lesson Content: {{{lessonContent}}}
  Questions: {{#each questions}}{{{this}}}\n{{/each}}
  Student Answers: {{#each studentAnswers}}{{{this}}}\n{{/each}}

  Please provide the response in the following JSON format:
  {
    "overallFeedback": "Overall feedback on the student performance.",
    "detailedFeedback": [
      {
        "question": "The question that was asked.",
        "studentAnswer": "The student answer to the question.",
        "feedback": "Detailed feedback on the student answer.",
        "score": "A score representing how good the answer was."
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
