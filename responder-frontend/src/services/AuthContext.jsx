import React, { createContext, useContext, useState, useEffect } from 'react';
import { responderApi } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // Add a timeout to the request to prevent hanging forever
      const fetchPromise = responderApi.getMe();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 5000)
      );
      
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (res.data.role === 'responder' || res.data.role === 'admin') {
        setUser(res.data);
      } else {
        logout();
        alert("Access Denied: Not a responder account.");
      }
    } catch (e) {
      console.error("Auth initialization failed:", e.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('responder_token');
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const res = await responderApi.login(formData);
    localStorage.setItem('responder_token', res.data.access_token);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('responder_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
