import { Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import LoginForm from "../Auth/LoginForm"
import SignUpForm from "../Auth/SignUpForm"
import LanguageSwitcher from "../LanguageSwitcher"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

const AuthLayout = () => {
  const { t } = useTranslation()
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a preference stored in localStorage
    const savedMode = localStorage.getItem("darkMode")
    return savedMode === "true" || (!savedMode && window.matchMedia("(prefers-color-scheme: dark)").matches)
  })

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save preference to localStorage
    localStorage.setItem("darkMode", isDarkMode.toString())
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-finance-blue-50 to-finance-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header with language switcher */}
      <div className="w-full p-4 flex justify-end items-center">
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-all"
          >
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl h-auto md:h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* Form section - make it take full width on mobile */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 flex justify-center items-center">
              <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/sign-up" element={<SignUpForm />} />
              </Routes>
            </div>

            {/* Image section - hide on small screens, show on medium and up */}
            <div className="hidden md:block md:w-1/2 bg-custom-gradient relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-finance-blue-600/80 to-finance-blue-800/80 z-10"></div>
              <img src="/Finance-Img.png" alt="Finance" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-center items-center z-20 p-10 text-white">
                <h2 className="text-3xl font-bold mb-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center mr-3 shadow-lg ">
                    <img src="/favicon.ico" alt="Finlo" className="w-7 h-7 object-contain" />
                  </div>
                  Finlo
                </h2>
                <p className="text-lg text-center mb-6">{t("auth.tagline")}</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>{t("auth.features.tracking")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <span>{t("auth.features.insights")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>{t("auth.features.goals")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full p-4 text-center text-gray-600 dark:text-gray-400">
        <p>© 2025 Finlo. {t("auth.rights")}</p>
      </div>
    </div>
  )
}

export default AuthLayout

