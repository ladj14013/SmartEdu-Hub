'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
    try {
        // Try to initialize with service account from environment variables (for production)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        initializeApp({
            credential: cert(serviceAccount)
        });
    } catch (e) {
        console.error("Admin SDK initialization failed:", e);
        // Fallback for local development if service account is not set
        initializeApp();
    }
}

/**
 * Server Action to link a student to a teacher for a specific subject.
 * @param studentId - The ID of the student.
 * @param subjectId - The ID of the subject.
 * @param teacherId - The ID of the teacher to link.
 * @returns An object indicating success or failure.
 */
export async function linkStudentToTeacher(studentId: string, subjectId: string, teacherId:string) {
  try {
    const firestore = getFirestore();
    const studentRef = firestore.collection('users').doc(studentId);
    
    // Use dot notation to update a specific field within the linkedTeachers map
    await studentRef.update({
      [`linkedTeachers.${subjectId}`]: teacherId
    });

    return { success: true, message: 'تم الارتباط بنجاح!' };
  } catch (error) {
    console.error('Error linking student to teacher:', error);
    return { success: false, error: 'فشل تحديث قاعدة البيانات. حدث خطأ غير متوقع.' };
  }
}
