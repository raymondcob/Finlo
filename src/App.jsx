import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { PageTitleProvider } from "./context/PageTitleContext";
import LoadingSpinner from "./components/LoadingSpinner";
import AppRoutes from "./routes/AppRoutes";
import './config/i18n';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple resource loading check
    const handleLoad = () => {
      if (document.readyState === "complete") {
        setIsLoading(false);
      }
    };

    // Check if already loaded
    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <UserProvider>
      <PageTitleProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PageTitleProvider>
    </UserProvider>
  );
}

export default App;
