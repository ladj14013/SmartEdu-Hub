'use server';
/**
 * @fileOverview A flow to securely find a teacher by their unique code for a specific subject.
 *
 * - getTeacherByCode - A function that finds a teacher's ID and name based on a code and subject.
 * - GetTeacherByCodeInput - The input type for the getTeacherByCode function.
 * - GetTeacherByCodeOutput - The return type for the getTeacherByCode function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore} from 'firebase-admin/firestore';

const GetTeacherByCodeInputSchema = z.object({
  teacherCode: z.string().describe('The unique code of the teacher.'),
  subjectId: z.string().describe('The subject ID to which the teacher code should belong.'),
});

export type GetTeacherByCodeInput = z.infer<typeof GetTeacherByCodeInputSchema>;

const GetTeacherByCodeOutputSchema = z.object({
  teacherId: z.string().optional(),
  teacherName: z.string().optional(),
});

export type GetTeacherByCodeOutput = z.infer<typeof GetTeacherByCodeOutputSchema>;


export async function getTeacherByCode(
  input: GetTeacherByCodeInput
): Promise<GetTeacherByCodeOutput> {
  return getTeacherByCodeFlow(input);
}


const getTeacherByCodeFlow = ai.defineFlow(
  {
    name: 'getTeacherByCodeFlow',
    inputSchema: GetTeacherByCodeInputSchema,
    outputSchema: GetTeacherByCodeOutputSchema,
  },
  async ({ teacherCode, subjectId }) => {
    // This flow runs on the server with admin privileges.
    const firestore = getFirestore();
    
    // Query for the teacher using only the code and role. This is a simple query.
    const teachersCol = firestore.collection('users');
    const q = teachersCol
      .where('teacherCode', '==', teacherCode)
      .where('role', '==', 'teacher')
      .limit(1);

    const teacherSnapshot = await q.get();

    // If no teacher is found with that code, return empty.
    if (teacherSnapshot.empty) {
        return {};
    }
    
    const teacherDoc = teacherSnapshot.docs[0];
    const teacherData = teacherDoc.data();
    
    // Manually verify if the found teacher's subjectId matches the required one.
    if (teacherData.subjectId !== subjectId) {
        // The code is correct, but for the wrong subject. Treat as not found.
        return {};
    }
    
    // If everything matches, return the teacher's data.
    return {
        teacherId: teacherDoc.id,
        teacherName: teacherData.name,
    };
  }
);
