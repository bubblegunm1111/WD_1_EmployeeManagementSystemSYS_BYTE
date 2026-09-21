import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
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
        // Retrieve role from localStorage for now (would typically be stored in Firestore claims)
        const storedRole = localStorage.getItem('role') || 'employee';
        setRole(storedRole);
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
    setRole(selectedRole);
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
