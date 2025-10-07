'use server';
/**
 * @fileOverview A lesson content summarization AI agent.
 *
 * - summarizeLessonContent - A function that handles the lesson content summarization process.
 * - SummarizeLessonContentInput - The input type for the summarizeLessonContent function.
 * - SummarizeLessonContentOutput - The return type for the summarizeLessonContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLessonContentInputSchema = z.object({
  lessonContent: z.string().describe('The content of the lesson to be summarized.'),
});
export type SummarizeLessonContentInput = z.infer<typeof SummarizeLessonContentInputSchema>;

const SummarizeLessonContentOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the lesson content.'),
});
export type SummarizeLessonContentOutput = z.infer<typeof SummarizeLessonContentOutputSchema>;

export async function summarizeLessonContent(input: SummarizeLessonContentInput): Promise<SummarizeLessonContentOutput> {
  return summarizeLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLessonContentPrompt',
  input: {schema: SummarizeLessonContentInputSchema},
  output: {schema: SummarizeLessonContentOutputSchema},
  prompt: `You are an AI assistant designed to summarize lesson content for students.

  Please provide a concise and informative summary of the following lesson content:

  {{{lessonContent}}}
  `,
});

const summarizeLessonContentFlow = ai.defineFlow(
  {
    name: 'summarizeLessonContentFlow',
    inputSchema: SummarizeLessonContentInputSchema,
    outputSchema: SummarizeLessonContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output,
    };
  }
);
