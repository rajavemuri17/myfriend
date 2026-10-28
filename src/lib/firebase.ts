import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust offline local cache persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign In with Popup
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Sync or create user profile in Firestore
      await saveUserProfile(user.uid, {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Friend',
        updatedAt: new Date().toISOString(),
      });
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Save or update user companion preferences in Firestore
export async function saveUserProfile(
  userId: string,
  data: {
    userId: string;
    email: string;
    displayName?: string;
    preferredLanguage?: string;
    preferredVoice?: string;
    ambientSound?: string;
    ambientVolume?: number;
    updatedAt?: string;
  }
) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Load user companion preferences from Firestore
export async function loadUserProfile(userId: string) {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Save a conversation turn into user's subcollection
export async function saveConversationTurn(
  userId: string,
  turn: { id: string; sender: 'user' | 'serenade'; text: string; timestamp: string }
) {
  const path = `users/${userId}/conversations/${turn.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'conversations', turn.id), {
      ...turn,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Load recent conversation turns from Firestore
export async function loadRecentConversations(userId: string) {
  const path = `users/${userId}/conversations`;
  try {
    const q = query(collection(db, 'users', userId, 'conversations'), orderBy('timestamp', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data()).reverse();
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// Save a mindful note or reflection
export async function saveSessionNote(
  userId: string,
  note: { id: string; title: string; content: string; mood?: string; createdAt: string }
) {
  const path = `users/${userId}/notes/${note.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'notes', note.id), {
      ...note,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Load session notes
export async function loadSessionNotes(userId: string) {
  const path = `users/${userId}/notes`;
  try {
    const q = query(collection(db, 'users', userId, 'notes'), orderBy('createdAt', 'desc'), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
