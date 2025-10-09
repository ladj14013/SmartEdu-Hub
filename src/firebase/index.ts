'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
        // Initialize with config for emulator support
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        try {
            // Attempt to initialize via Firebase App Hosting environment variables
            firebaseApp = initializeApp();
        } catch (e) {
            // Fallback to local config if App Hosting init fails
            if (process.env.NODE_ENV === "production") {
              console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
            }
            firebaseApp = initializeApp(firebaseConfig);
        }
    }
    return getSdks(firebaseApp);
  }
  
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    // Check if not already connected
    // @ts-ignore // host is private attribute
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    // @ts-ignore // _settings is private attribute
    if (!firestore._settings.host) {
       connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    }
  }

  // Set persistence to 'local' for web clients
  setPersistence(auth, browserLocalPersistence);

  return {
    firebaseApp,
    auth,
    firestore,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './errors';
export * from './error-emitter';
