'use server';
/**
 * @fileOverview Securely fetches a teacher's name by their code and subject, or by their ID.
 *
 * - getTeacherByCode - A function that finds a teacher and returns their name.
 * - GetTeacherByCodeInput - The input type for the function.
 * - GetTeacherByCodeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import type { User } from '@/lib/types';

// Server-side Firestore initialization
if (getAdminApps().length === 0) {
  try {
    // This will automatically use GOOGLE_APPLICATION_CREDENTIALS in production
    initializeAdminApp();
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
  }
}
const db = getFirestore();

const GetTeacherByCodeInputSchema = z.object({
  teacherCode: z.string().optional().describe('The unique code for the teacher.'),
  subjectId: z.string().optional().describe('The subject ID to ensure the teacher is for the correct subject.'),
  teacherId: z.string().optional().describe('The unique ID of the teacher.'),
});
export type GetTeacherByCodeInput = z.infer<typeof GetTeacherByCodeInputSchema>;

const GetTeacherByCodeOutputSchema = z.object({
  teacherId: z.string().optional(),
  teacherName: z.string().optional(),
  error: z.string().optional(),
});
export type GetTeacherByCodeOutput = z.infer<typeof GetTeacherByCodeOutputSchema>;


export async function getTeacherByCode(input: GetTeacherByCodeInput): Promise<GetTeacherByCodeOutput> {
  return getTeacherByCodeFlow(input);
}


const getTeacherByCodeFlow = ai.defineFlow(
  {
    name: 'getTeacherByCodeFlow',
    inputSchema: GetTeacherByCodeInputSchema,
    outputSchema: GetTeacherByCodeOutputSchema,
  },
  async ({ teacherCode, subjectId, teacherId }) => {
    try {
      const teachersRef = db.collection('users');
      
      if (teacherId) {
        const teacherDoc = await teachersRef.doc(teacherId).get();
        if (!teacherDoc.exists) {
            return { error: 'No teacher found with this ID.' };
        }
        const teacherData = teacherDoc.data() as User;
        return {
            teacherId: teacherDoc.id,
            teacherName: teacherData.name,
        };
      }

      if (teacherCode && subjectId) {
        const snapshot = await teachersRef
          .where('teacherCode', '==', teacherCode)
          .where('subjectId', '==', subjectId)
          .where('role', '==', 'teacher')
          .limit(1)
          .get();

        if (snapshot.empty) {
          return { error: 'No teacher found with this code for the specified subject.' };
        }

        const teacherDoc = snapshot.docs[0];
        const teacherData = teacherDoc.data() as User;

        return {
          teacherId: teacherDoc.id,
          teacherName: teacherData.name,
        };
      }

      return { error: 'Invalid input. Provide either teacherId or both teacherCode and subjectId.' };

    } catch (e) {
      console.error('Error in getTeacherByCodeFlow:', e);
      return { error: 'An unexpected error occurred.' };
    }
  }
);
