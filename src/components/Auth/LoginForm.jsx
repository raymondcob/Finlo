import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { UserContext } from "../../context/UserContext";
import {
  FaGoogle,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const LoginForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (error) {
      // Simplified error message
      setError("Wrong email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      navigate("/dashboard");
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        setError("Failed to sign in with Google");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Make the form more responsive for smaller screens
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md px-2 sm:px-0"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t("auth.login.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t("auth.login.subtitle")}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("auth.login.email")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
                className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-finance-blue-500 transition-all duration-200"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("auth.login.password")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.login.passwordPlaceholder")}
                className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-finance-blue-500 transition-all duration-200"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-1">
              <a
                href="#"
                className="text-sm text-finance-blue-600 hover:text-finance-blue-500 dark:text-finance-blue-400"
              >
                {t("auth.login.forgotPassword")}
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center gap-2 bg-finance-blue-600 hover:bg-finance-blue-700 text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-finance-blue-500 transition-colors duration-200 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("common.loading")}
            </>
          ) : (
            t("auth.login.loginButton")
          )}
        </button>

        <div className="relative flex items-center justify-center mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
            {t("auth.login.orDivider")}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`w-full flex justify-center items-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-finance-blue-500 transition-colors duration-200 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <FaGoogle className="text-red-500" />
          {t("auth.login.googleLogin")}
        </button>

        <p className="text-center text-gray-600 dark:text-gray-300 mt-6">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/auth/sign-up"
            className="text-finance-blue-600 hover:text-finance-blue-500 dark:text-finance-blue-400 font-medium"
          >
            {t("auth.login.signUp")}
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default LoginForm;
