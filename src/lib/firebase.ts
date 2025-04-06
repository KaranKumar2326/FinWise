import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClztPfg4UM7b_aQ8SCU_Ay_Px3My6OfzU",
  authDomain: "finbuzz-aa177.firebaseapp.com",
  projectId: "finbuzz-aa177",
  storageBucket: "finbuzz-aa177.firebasestorage.app",
  messagingSenderId: "789677757919",
  appId: "1:789677757919:web:a54746203cb1b52b46e06a",
  measurementId: "G-K8VK9K43N7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence (non-blocking)
enableIndexedDbPersistence(db).catch(console.warn);

// Cache for user profiles to avoid repeated Firestore reads
const userProfileCache = new Map<string, any>();

// Helper function to update localStorage without blocking
const updateLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage update failed', e);
  }
};

// Fast sign-in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Minimal localStorage update for immediate UI response
    updateLocalStorage('userProfile', {
      firstName: user.displayName?.split(' ')[0] || 'User',
      lastName: user.displayName?.split(' ')[1] || '',
      email: user.email,
      currency: 'INR',
      uid: user.uid
    });

    // Firestore update in background
    setDoc(doc(db, "users", user.uid), {
      firstName: user.displayName?.split(' ')[0] || 'User',
      lastName: user.displayName?.split(' ')[1] || '',
      email: user.email,
      currency: 'INR',
      uid: user.uid,
      lastUpdated: new Date().toISOString()
    }, { merge: true }).catch(console.warn);

    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Optimized email/password sign-up
export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  currency: string = 'INR'
): Promise<User> => {
  // Input validation
  if (!email || !password || !firstName || !lastName) {
    throw new Error('All fields are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    // 1. Create user (core authentication)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Update display name (non-blocking)
    updateProfile(user, { displayName: firstName }).catch(console.warn);

    // 3. Prepare profile data
    const profileData = {
      firstName,
      lastName,
      email,
      currency,
      uid: user.uid,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // 4. Update cache and localStorage immediately
    userProfileCache.set(user.uid, profileData);
    updateLocalStorage('userProfile', profileData);

    // 5. Firestore update in background
    setDoc(doc(db, "users", user.uid), profileData).catch(console.warn);

    return user;
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters');
    }
    throw new Error('Signup failed. Please try again.');
  }
};

// Fast email/password sign-in
export const signIn = async (email: string, password: string) => {
  try {
    // 1. Core authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Check cache first for immediate response
    const cachedProfile = userProfileCache.get(user.uid);
    if (cachedProfile) {
      updateLocalStorage('userProfile', cachedProfile);
      return user;
    }

    // 3. Check localStorage for fast fallback
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed.uid === user.uid) {
          userProfileCache.set(user.uid, parsed);
          return user;
        }
      } catch (e) {
        console.warn('Failed to parse stored profile', e);
      }
    }

    // 4. Firestore lookup with timeout
    try {
      const userDoc = await Promise.race([
        getDoc(doc(db, "users", user.uid)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 3000)
        )
      ]);

      if (userDoc.exists()) {
        const profileData = userDoc.data();
        userProfileCache.set(user.uid, profileData);
        updateLocalStorage('userProfile', profileData);
      } else {
        // Fallback to minimal profile
        const fallbackProfile = {
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          currency: 'INR',
          uid: user.uid
        };
        updateLocalStorage('userProfile', fallbackProfile);
      }
    } catch (firestoreError) {
      console.warn('Firestore profile fetch failed', firestoreError);
      // Use minimal profile if Firestore fails
      updateLocalStorage('userProfile', {
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: '',
        currency: 'INR',
        uid: user.uid
      });
    }

    return user;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    }
    throw new Error('Login failed. Please check your credentials.');
  }
};

// Optimized auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Check cache first for immediate response
      const cachedProfile = userProfileCache.get(user.uid);
      if (cachedProfile) {
        callback(user);
        return;
      }

      // Async profile loading doesn't block the callback
      loadUserProfile(user).catch(console.warn);
    }
    callback(user);
  });
};

// Helper to load user profile (non-blocking)
const loadUserProfile = async (user: User) => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const profileData = userDoc.data();
      userProfileCache.set(user.uid, profileData);
      updateLocalStorage('userProfile', profileData);
    } else {
      // Create minimal profile if none exists
      const fallbackProfile = {
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email,
        currency: 'INR',
        uid: user.uid
      };
      updateLocalStorage('userProfile', fallbackProfile);
      // Save to Firestore in background
      setDoc(doc(db, "users", user.uid), {
        ...fallbackProfile,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }).catch(console.warn);
    }
  } catch (error) {
    console.warn('Profile load failed', error);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('userProfile');
    userProfileCache.clear();
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};

export { auth, db };