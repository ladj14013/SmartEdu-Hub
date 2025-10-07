'use client';
import {useEffect, useState} from 'react';

import {FirebaseProvider, initializeFirebase} from '@/firebase';
import type {FirebaseServices} from '@/firebase/types';

export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const [firebase, setFirebase] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Initialize firebase on the client.
    const firebaseServices = initializeFirebase();
    setFirebase(firebaseServices);
  }, []);

  if (!firebase) {
    // Show a loading indicator or a fallback UI while Firebase is initializing.
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.firebaseApp}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
