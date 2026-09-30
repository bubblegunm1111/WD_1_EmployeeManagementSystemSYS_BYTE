import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ 
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        });
        // Retrieve role from localStorage for now
        let resolvedRole = localStorage.getItem('role') || 'employee';
        
        // Hardcode the primary admin email to guarantee admin access even if localStorage is wiped by adblockers during redirect
        if (firebaseUser.email === 'sys1.admin.system@gmail.com') {
          resolvedRole = 'admin';
          localStorage.setItem('role', 'admin');
        }

        setRole(resolvedRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const login = async (email, password, selectedRole) => {
    localStorage.setItem('role', selectedRole);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setRole(selectedRole);
    return userCredential;
  };

  const signup = async (email, password, selectedRole, additionalData) => {
    localStorage.setItem('role', selectedRole);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setRole(selectedRole);
    // In a real app, you would save additionalData (like Org Name) to Firestore here
    return userCredential;
  };

  const loginWithGoogle = async (selectedRole) => {
    localStorage.setItem('role', selectedRole);
    const result = await signInWithPopup(auth, googleProvider);
    
    // We still keep the hardcoded email check in onAuthStateChanged,
    // but we can also set the state here immediately for snappier UX
    if (result.user.email === 'sys1.admin.system@gmail.com') {
      setRole('admin');
      localStorage.setItem('role', 'admin');
    } else {
      setRole(selectedRole);
    }
    
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
