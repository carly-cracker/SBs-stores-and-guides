import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  const isAdmin = currentUser && currentUser.email === "carlkorir226@gmail.com";

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
