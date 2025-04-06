import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
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

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Auth functions
export const signUp = async (email: string, password: string, firstName: string, lastName: string, currency: string = 'INR') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, {
      displayName: firstName
    });

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      currency,
      createdAt: new Date().toISOString()
    });

    // Store user profile in localStorage immediately
    localStorage.setItem('userProfile', JSON.stringify({
      firstName,
      lastName,
      email,
      currency
    }));

    return user;
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
      // Get user data from Firestore with timeout
      const userDoc = await Promise.race([
        getDoc(doc(db, "users", user.uid)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      if (userDoc && 'exists' in userDoc && userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('userProfile', JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          currency: userData.currency
        }));
      } else {
        // Fallback to basic profile if Firestore is unavailable
        localStorage.setItem('userProfile', JSON.stringify({
          email: user.email,
          firstName: user.displayName || 'User',
          lastName: '',
          currency: 'INR'
        }));
      }
    } catch (firestoreError) {
      console.warn('Failed to fetch Firestore profile:', firestoreError);
      // Fallback to basic profile
      localStorage.setItem('userProfile', JSON.stringify({
        email: user.email,
        firstName: user.displayName || 'User',
        lastName: '',
        currency: 'INR'
      }));
    }

    return user;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error(error.message);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('userProfile');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message);
  }
};

// Auth context
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user && !localStorage.getItem('userProfile')) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem('userProfile', JSON.stringify({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            currency: userData.currency
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch user profile:', error);
        // Fallback to basic profile
        localStorage.setItem('userProfile', JSON.stringify({
          email: user.email,
          firstName: user.displayName || 'User',
          lastName: '',
          currency: 'INR'
        }));
      }
    }
    callback(user);
  });
};

export { auth, db };