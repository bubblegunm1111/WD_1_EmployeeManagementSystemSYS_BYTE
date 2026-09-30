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
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ 
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        });
        
        // Save token to localStorage for api.js fallback
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
        } catch (e) {
          console.error("Failed to get ID token", e);
        }

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
        localStorage.removeItem('token');
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
    
    if (selectedRole === 'admin') {
      try {
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        await api.post('/auth/register', {
          email,
          uid: userCredential.user.uid,
          orgName: additionalData.orgName,
          fullName: additionalData.fullName
        });
      } catch (err) {
        console.error('Failed to register organization on backend', err);
      }
    }
    
    setRole(selectedRole);
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
      // If they are logging in as Admin via Google, ensure they have an organization
      if (selectedRole === 'admin') {
        try {
          const token = await result.user.getIdToken();
          localStorage.setItem('token', token);
          await api.post('/auth/register', {
            email: result.user.email,
            uid: result.user.uid,
            orgName: `${result.user.displayName || 'My'} Organization`,
            fullName: result.user.displayName
          });
        } catch (err) {
          // If it fails with 409, it means the organization already exists, which is fine!
          if (err.response?.status !== 409) {
            console.error('Failed to auto-register google admin organization', err);
          }
        }
      }
      setRole(selectedRole);
    }
    
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('role');
    localStorage.removeItem('token');
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
