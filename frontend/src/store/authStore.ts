import { create } from 'zustand'
import { User, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider, db } from '../lib/firebase'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'

export interface UserData {
  plan: 'free' | 'pro'
  recipesCount: number
  extractionsThisMonth: number
  displayName: string | null
  email: string | null
  photoURL: string | null
  following: string[]
}

interface AuthStore {
  user: User | null
  userData: UserData | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  init: () => void
}

let unsubUserDoc: (() => void) | null = null

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userData: null,
  loading: true,

  init: () => {
    onAuthStateChanged(auth, (user) => {
      if (unsubUserDoc) { unsubUserDoc(); unsubUserDoc = null }

      if (user) {
        unsubUserDoc = onSnapshot(doc(db, 'users', user.uid), (snap) => {
          const data = snap.data()
          set({
            userData: data ? {
              plan: data.plan || 'free',
              recipesCount: data.recipesCount ?? 0,
              extractionsThisMonth: data.extractionsThisMonth ?? 0,
              displayName: data.displayName ?? null,
              email: data.email ?? null,
              photoURL: data.photoURL ?? null,
              following: data.following ?? [],
            } : null,
          })
        })
        set({ user, loading: false })
      } else {
        set({ user: null, userData: null, loading: false })
      }
    })
  },

  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider)
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      createdAt: serverTimestamp(),
      plan: 'free',
      recipesCount: 0,
      extractionsThisMonth: 0,
      following: [],
    }, { merge: true })
  },

  signInWithEmail: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  },

  signUpWithEmail: async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName: name,
      email,
      photoURL: null,
      createdAt: serverTimestamp(),
      plan: 'free',
      recipesCount: 0,
      extractionsThisMonth: 0,
      following: [],
    })
  },

  logout: () => signOut(auth),
}))
