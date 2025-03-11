import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import UpperNav from "../UpperNav"
import Sidebar from "../Sidebar"

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <UpperNav onMenuClick={toggleSidebar} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onMenuClick={toggleSidebar} />
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isMobile ? "w-full" : isSidebarOpen ? "ml-0" : "ml-0"
          } dark:bg-gray-900 dark:text-white`}
        >
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout;

