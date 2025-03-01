import { FaBars } from "react-icons/fa"
import { BsGraphUp } from "react-icons/bs"
import { useContext, useState, useRef, useEffect } from "react"
import { PageTitleContext } from "../context/PageTitleContext"
import { UserContext } from "../context/UserContext"
import { MdOutlineDarkMode, MdOutlineWbSunny, MdOutlineNotificationsActive } from "react-icons/md"
import { FiSearch, FiChevronDown, FiLogOut, FiUser, FiSettings } from "react-icons/fi"
import { auth } from "../config/firebase"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import LanguageSwitcher from "./LanguageSwitcher"

const UpperNav = ({ onMenuClick, isDarkMode, toggleDarkMode }) => {
  const { pageTitle } = useContext(PageTitleContext)
  const { user } = useContext(UserContext)
  const [imgError, setImgError] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
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

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "New feature available",
      message: "Check out our new reports section",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Transaction completed",
      message: "Your recent transaction has been processed",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 3,
      title: "Account update",
      message: "Your account details have been updated",
      time: "3 days ago",
      unread: false,
    },
  ]

  return (
    <div className="flex items-center h-16 bg-white dark:bg-gray-800 dark:text-white w-full box-border shadow-md px-4 transition-colors duration-300">
      {/* Left section with menu button and logo */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 mr-2 md:hidden"
          onClick={onMenuClick}
        >
          <FaBars className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="hidden md:flex items-center">
          <BsGraphUp className="w-6 h-6 text-finance-blue-600 dark:text-finance-blue-400" />
          <h2 className="text-lg font-semibold text-finance-blue-700 dark:text-finance-blue-300 ml-2">StackUp</h2>
        </div>
      </div>

      {/* Middle section with page title and search */}
      <div className="flex-grow flex items-center justify-between px-4">
        <div className="text-xl font-semibold text-gray-800 dark:text-white hidden md:block">{pageTitle}</div>
        <div className="text-xl font-semibold text-gray-800 dark:text-white hidden md:block"><LanguageSwitcher/></div>

        <div className="relative max-w-md w-full hidden md:block ">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Right section with icons and profile */}
      <div className="flex items-center gap-1 md:gap-3">
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

        {/* Notifications dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <MdOutlineNotificationsActive className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {notifications.some((n) => n.unread) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notification.unread ? "bg-finance-blue-50 dark:bg-finance-blue-900/30" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800 dark:text-white">{notification.title}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-center">
                <button className="text-sm text-finance-blue-600 dark:text-finance-blue-400 hover:text-finance-blue-800 dark:hover:text-finance-blue-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

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

export default UpperNav;

