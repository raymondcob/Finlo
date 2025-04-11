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
import { LoadingProvider } from "./context/LoadingContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./config/i18n";
import { Analytics } from "@vercel/analytics/react"

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
    <>
    <LoadingProvider>
      <UserProvider>
        <I18nextProvider i18n={i18n}>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <LoadingSpinner />
              <PageTitleProvider>
                <Toaster position="top-right" />
                <AppRoutes />
              </PageTitleProvider>
            </div>
          </Router>
        </I18nextProvider>
      </UserProvider>
    </LoadingProvider>

    <Analytics /> // Add this line to include Vercel Analytics

    </>
  );
}

export default App;
