'use server';

import { getTeacherByCode as getTeacherByCodeFlow, type GetTeacherByCodeInput, type GetTeacherByCodeOutput } from '@/ai/flows/get-teacher-by-code';

export async function getTeacherByCode(input: GetTeacherByCodeInput): Promise<GetTeacherByCodeOutput> {
  return await getTeacherByCodeFlow(input);
}
