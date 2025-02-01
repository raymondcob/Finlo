import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!loading) {
      setCurrentUser(user);
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <UserContext.Provider value={{ user: currentUser, setUser: setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};