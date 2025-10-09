'use server';
/**
 * @fileOverview Securely fetches a teacher's name by their code and subject.
 *
 * - getTeacherByCode - A function that finds a teacher and returns their name.
 * - GetTeacherByCodeInput - The input type for the function.
 * - GetTeacherByCodeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { User } from '@/lib/types';

// Server-side Firestore initialization
if (getAdminApps().length === 0) {
  try {
    // Attempt to use environment variables for credentials in production
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : undefined;
    if (credentials) {
      initializeAdminApp({ credential: cert(credentials) });
    } else {
      // Fallback for local development if env var is not set, but this might fail.
      // A better local setup would involve setting the GOOGLE_APPLICATION_CREDENTIALS env var.
      initializeAdminApp();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // In a real app, you might want to handle this more gracefully.
  }
}
const db = getFirestore();

const GetTeacherByCodeInputSchema = z.object({
  teacherCode: z.string().describe('The unique code for the teacher.'),
  subjectId: z.string().describe('The subject ID to ensure the teacher is for the correct subject.'),
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
  async ({ teacherCode, subjectId }) => {
    try {
      const teachersRef = db.collection('users');
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
    } catch (e) {
      console.error('Error in getTeacherByCodeFlow:', e);
      return { error: 'An unexpected error occurred.' };
    }
  }
);