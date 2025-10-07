import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

import {firebaseConfig} from './config';
import type {FirebaseServices} from './types';

export * from './provider';
export * from './auth/use-user';


// Initialize Firebase
export function initializeFirebase(): FirebaseServices {
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  // Explicitly connect to the 'smart-education' database
  const firestore = getFirestore(firebaseApp, 'smart-education');
  return {firebaseApp, auth, firestore};
}
