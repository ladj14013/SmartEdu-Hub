'use server';

/**
 * @fileOverview Server actions related to teacher operations.
 */

import { getTeacherByCode as getTeacherByCodeFlow } from '@/ai/flows/get-teacher-by-code';
import type { GetTeacherByCodeInput } from '@/ai/flows/get-teacher-by-code';

/**
 * A server action that wraps the getTeacherByCode Genkit flow.
 * This allows client components to call the flow securely.
 *
 * @param {GetTeacherByCodeInput} input - The input for the flow, containing teacherCode and subjectId.
 * @returns {Promise<{success: boolean, teacherName?: string, teacherId?: string, error?: string}>} - The result of the operation.
 */
export async function getTeacherByCode(input: GetTeacherByCodeInput) {
  try {
    const result = await getTeacherByCodeFlow(input);
    if (result.teacherFound) {
      return {
        success: true,
        teacherName: result.teacherName,
        teacherId: result.teacherId,
      };
    } else {
      return { success: false, error: result.reason };
    }
  } catch (error) {
    console.error('Error in getTeacherByCode server action:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
