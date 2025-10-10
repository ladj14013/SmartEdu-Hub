
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

/**
 * A server action that links a student to a teacher for a specific subject.
 * This function must run on the server to have administrative privileges
 * to update the user document.
 * 
 * @param studentId The ID of the student to update.
 * @param subjectId The ID of the subject to link.
 * @param teacherId The ID of the teacher to link.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function linkStudentToTeacher(studentId: string, subjectId: string, teacherId: string) {
    try {
        const firestore = getFirestore();
        const studentRef = firestore.collection('users').doc(studentId);
        
        // Use dot notation to update a specific field in the map
        // This is safer as it doesn't overwrite other linked teachers.
        await studentRef.update({
            [`linkedTeachers.${subjectId}`]: teacherId
        });
        
        return { success: true };
    } catch (error) {
        console.error("Server Action Error (linkStudentToTeacher):", error);
        return { success: false, error: 'فشل تحديث قاعدة البيانات عند محاولة ربط التلميذ.' };
    }
}
