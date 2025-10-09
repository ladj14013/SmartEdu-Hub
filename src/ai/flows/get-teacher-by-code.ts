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
    
    const teachersCol = firestore.collection('users');
    const q = teachersCol
      .where('teacherCode', '==', teacherCode)
      .where('subjectId', '==', subjectId)
      .where('role', '==', 'teacher')
      .limit(1);

    const teacherSnapshot = await q.get();

    if (teacherSnapshot.empty) {
        return {}; // Return empty object if not found
    }
    
    const teacherDoc = teacherSnapshot.docs[0];
    const teacherData = teacherDoc.data();
    
    return {
        teacherId: teacherDoc.id,
        teacherName: teacherData.name, // Corrected from teacherData.name
    };
  }
);
