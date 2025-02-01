import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Add a delay to ensure the loading spinner is visible for a minimum amount of time
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds delay

    return () => {
      unsubscribe();
      clearTimeout(delay);
    };
  }, []);

  return { user, loading };
};