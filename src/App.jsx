import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { UserProvider } from "./context/UserContext";
import { PageTitleProvider } from "./context/PageTitleContext";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";
import AppRoutes from "./routes/AppRoutes";
import "./config/i18n";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <UserProvider>
        <PageTitleProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </PageTitleProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
