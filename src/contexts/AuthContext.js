import { getDoc, doc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, firestore } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    return auth.signOut();
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if(user) {
        const docRef = doc(firestore, 'users', user.uid);
        const snapshot = await getDoc(docRef);
        const item = snapshot.data();
        let spreadObj = {};
        if(item.labId) {
          spreadObj = {
            labId: item.labId
          }
        }
        if(item.sem) {
          spreadObj = {
            sem: item.sem
          }
        }
        setCurrentUser({
          name: item.name, 
          role: item.role, 
          email: item.email, 
          uid: user.uid,
          ...spreadObj
        });
        setLoading(false);
      } else {
        setCurrentUser(user);
        setLoading(false);
      }  
    })
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
  };
  return (
    <AuthContext.Provider value={value}>
      { !loading && children }
    </AuthContext.Provider>
  );
}
