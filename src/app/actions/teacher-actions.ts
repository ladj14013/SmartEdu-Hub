'use server';

import { getTeacherByCode as getTeacherByCodeFlow, type GetTeacherByCodeInput } from '@/ai/flows/get-teacher-by-code';

export async function getTeacherByCode(input: GetTeacherByCodeInput) {
  return await getTeacherByCodeFlow(input);
}
