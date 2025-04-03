import { FaBars } from "react-icons/fa"
import { useContext, useState, useRef, useEffect } from "react"
import { PageTitleContext } from "../context/PageTitleContext"
import { UserContext } from "../context/UserContext"
import { MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md"
import { FiChevronDown, FiLogOut, FiUser, FiSettings } from "react-icons/fi"
import { auth } from "../config/firebase"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import LanguageSwitcher from "./LanguageSwitcher"

const UpperNav = ({ onMenuClick, isDarkMode, toggleDarkMode }) => {
  const { pageTitle } = useContext(PageTitleContext)
  const { user } = useContext(UserContext)
  const [imgError, setImgError] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/auth")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  return (
    <div className="flex items-center h-16 bg-white dark:bg-gray-800 dark:text-white w-full box-border shadow-md px-4 transition-colors duration-300">
      {/* Left section with menu button and logo */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 mr-2 md:hidden"
          onClick={onMenuClick}
        >
          <FaBars className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 " />
        </button>
        <div className="hidden md:flex items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <img src="/favicon.ico" alt="Finlo" className="w-8 h-8 object-contain" />
          </div>
          
        </div>
      </div>

      {/* Middle section with page title */}
      <div className="flex-grow flex items-center justify-between px-4">
        <div className="text-xl font-semibold text-gray-800 dark:text-white hidden md:block">{pageTitle}</div>
      </div>

      {/* Right section with language, theme, notifications and profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <MdOutlineWbSunny className="w-5 h-5 text-yellow-400" />
          ) : (
            <MdOutlineDarkMode className="w-5 h-5 text-gray-600" />
          )}
        </button>
        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.photoURL && !imgError ? (
              <img
                src={user.photoURL || "/placeholder.svg"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                key={user.photoURL}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-finance-blue-100 dark:bg-finance-blue-800 flex items-center justify-center text-finance-blue-700 dark:text-finance-blue-300">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <FiChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.displayName || "User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ""}</p>
              </div>
              <div className="py-1">
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiUser className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiSettings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
              <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpperNav

