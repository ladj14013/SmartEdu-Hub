'use server';
/**
 * @fileOverview A Genkit flow to find and verify a teacher by their unique code.
 * This flow runs on the server with admin privileges to query the users collection.
 *
 * - getTeacherByCode - A function that finds a teacher by code.
 * - GetTeacherByCodeInput - The input type for the getTeacherByCode function.
 * - GetTeacherByCodeOutput - The return type for the getTeacherByCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const GetTeacherByCodeInputSchema = z.object({
  teacherCode: z.string().describe('The unique code provided by the teacher.'),
  subjectId: z.string().describe('The subject ID the student is trying to link for.'),
});
export type GetTeacherByCodeInput = z.infer<typeof GetTeacherByCodeInputSchema>;

const GetTeacherByCodeOutputSchema = z.object({
  teacherFound: z.boolean().describe('Whether a matching teacher was found.'),
  teacherId: z.string().optional().describe('The ID of the found teacher.'),
  teacherName: z.string().optional().describe('The name of the found teacher.'),
  reason: z.string().optional().describe('The reason why the teacher was not found, if applicable.'),
});
export type GetTeacherByCodeOutput = z.infer<typeof GetTeacherByCodeOutputSchema>;


export const getTeacherByCode = ai.defineFlow(
  {
    name: 'getTeacherByCode',
    inputSchema: GetTeacherByCodeInputSchema,
    outputSchema: GetTeacherByCodeOutputSchema,
  },
  async ({ teacherCode, subjectId }) => {
    // This flow runs on the server with admin privileges.
    const firestore = getFirestore();
    
    // Step 1: Query for the teacher using only the code and role. This is a simple query.
    const teachersCol = firestore.collection('users');
    const q = teachersCol.where('teacherCode', '==', teacherCode).where('role', '==', 'teacher').limit(1);

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return { teacherFound: false, reason: 'كود الأستاذ غير صحيح.' };
    }

    const teacherDoc = querySnapshot.docs[0];
    const teacherData = teacherDoc.data();

    // Step 2: Verify if the found teacher teaches the correct subject.
    if (teacherData.subjectId !== subjectId) {
      return { teacherFound: false, reason: 'هذا الأستاذ لا يدرس هذه المادة.' };
    }

    // Step 3: If all checks pass, return the teacher's information.
    return {
      teacherFound: true,
      teacherId: teacherDoc.id,
      teacherName: teacherData.name,
    };
  }
);
