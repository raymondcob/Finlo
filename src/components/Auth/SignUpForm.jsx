import { Link, useNavigate } from "react-router-dom"
import { useState, useContext, useEffect } from "react"
import { auth } from "../../config/firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { UserContext } from "../../context/UserContext"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa"

function SignUpForm() {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0) // 0-4 scale
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  const navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  // Check password strength
  useEffect(() => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    setPasswordCriteria(criteria)

    // Calculate strength (0-4)
    const metCriteria = Object.values(criteria).filter(Boolean).length
    setPasswordStrength(metCriteria)
  }, [password])

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "Very Weak", color: "text-red-600" }
    if (passwordStrength === 1) return { text: "Weak", color: "text-red-500" }
    if (passwordStrength === 2) return { text: "Fair", color: "text-yellow-500" }
    if (passwordStrength === 3) return { text: "Good", color: "text-green-500" }
    if (passwordStrength >= 4) return { text: "Strong", color: "text-green-600" }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-600"
    if (passwordStrength === 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-green-500"
    if (passwordStrength >= 4) return "bg-green-600"
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate password strength
    if (passwordStrength < 3) {
      setError("Please create a stronger password that meets more criteria.")
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: name,
      })

      setUser(user)
      navigate("/dashboard")
    } catch (error) {
      console.error("Signup error:", error.code, error.message)

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please try another email or sign in.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.")
      } else {
        setError(error.message || "Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const strengthLabel = getPasswordStrengthLabel()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md px-2 sm:px-0"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("auth.signup.title")}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t("auth.signup.subtitle")}</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.signup.name")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                placeholder={t("auth.signup.namePlaceholder")}
                className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-finance-blue-500 transition-all duration-200"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.signup.email")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder={t("auth.signup.emailPlaceholder")}
                className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-finance-blue-500 transition-all duration-200"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.signup.password")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.signup.passwordPlaceholder")}
                className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-finance-blue-500 transition-all duration-200"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">Password Strength:</span>
                  <span className={`text-xs font-medium ${strengthLabel.color}`}>{strengthLabel.text}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>

                {/* Password criteria checklist */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {passwordCriteria.length ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                    <span className={passwordCriteria.length ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.uppercase ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                    <span
                      className={passwordCriteria.uppercase ? "text-green-600 dark:text-green-400" : "text-gray-500"}
                    >
                      Uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.lowercase ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                    <span
                      className={passwordCriteria.lowercase ? "text-green-600 dark:text-green-400" : "text-gray-500"}
                    >
                      Lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.number ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                    <span className={passwordCriteria.number ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                      Number
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.special ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                    <span className={passwordCriteria.special ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                      Special character
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm flex items-center gap-2">
            <FaExclamationTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("common.loading")}
            </>
          ) : (
            t("auth.signup.signUpButton")
          )}
        </button>

        <p className="text-center text-gray-600 dark:text-gray-300 mt-6">
          {t("auth.signup.haveAccount")}{" "}
          <Link
            to="/auth"
            className="text-finance-blue-600 hover:text-finance-blue-500 dark:text-finance-blue-400 font-medium"
          >
            {t("auth.signup.login")}
          </Link>
        </p>
      </form>
    </motion.div>
  )
}

export default SignUpForm

