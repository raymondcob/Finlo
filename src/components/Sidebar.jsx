import { useNavigate, useLocation } from "react-router-dom"
import { useState, useContext, useEffect } from "react"
import { AiFillHome } from "react-icons/ai"
import { FaMoneyBillTransfer } from "react-icons/fa6"
import { FaFileInvoiceDollar } from "react-icons/fa"
import { GiWallet } from "react-icons/gi"
import { IoMdSettings } from "react-icons/io"
import { PageTitleContext } from "../context/PageTitleContext"
import { motion, AnimatePresence } from "framer-motion"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { PiTipJarLight } from "react-icons/pi";
import {useTranslation} from 'react-i18next';

const Sidebar = ({ isOpen, onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const location = useLocation()
  const { setPageTitle } = useContext(PageTitleContext)
  const [activeItem, setActiveItem] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const path = location.pathname.split("/")[1] || "dashboard"
    setActiveItem(path)

    const menuItem = menuItems.find((item) => item.id === path)
    if (menuItem) {
      setPageTitle(menuItem.label)
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [location.pathname, setPageTitle])

  const menuItems = [
    { id: "dashboard", label: t('navigation.dashboard'), icon: AiFillHome, path: "/dashboard" },
    { id: "transactions", label: t('navigation.transactions'), icon: FaMoneyBillTransfer, path: "/transactions" },
    { id: "reports", label: t('navigation.reports'), icon: FaFileInvoiceDollar, path: "/reports" },
    { id: "income", label: t('navigation.income'), icon: GiWallet, path: "/income" },
    { id: "savings-goals", label: t('navigation.savingsGoals'), icon: PiTipJarLight, path: "/savings-goals" },
    { id: "settings", label: t('navigation.settings'), icon: IoMdSettings, path: "/settings" },
  ]

  const handleMenuClick = (path, id, label) => {
    navigate(path)
    setActiveItem(id)
    setPageTitle(label)
    if (isMobile) {
      onMenuClick()
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  const sidebarVariants = {
    open: {
      width: isCollapsed ? "5rem" : "16rem",
      transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.2 },
    },
    closed: {
      width: "0rem",
      transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.2 },
    },
  }

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.2 },
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.2 },
    },
  }

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={onMenuClick} />}

      <AnimatePresence>
        <motion.div
          className={`fixed inset-y-0 left-0 z-30 md:relative md:z-0 min-h-[90vh] bg-white shadow-lg flex flex-col dark:bg-gray-800 dark:text-white transition-all duration-200 ease-in-out overflow-hidden`}
          initial={isMobile ? "closed" : "open"}
          animate={isOpen || !isMobile ? "open" : "closed"}
          variants={sidebarVariants}
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-finance-blue-600 flex items-center justify-center text-white font-bold">
                SU
              </div>
              {(!isCollapsed || isMobile) && (
                <h2 className="text-lg font-semibold text-finance-blue-700 dark:text-finance-blue-300">StackUp</h2>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeItem === item.id
                      ? "bg-finance-blue-50 text-finance-blue-700 dark:bg-finance-blue-900/30 dark:text-finance-blue-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleMenuClick(item.path, item.id, item.label)}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      activeItem === item.id
                        ? "bg-finance-blue-100 text-finance-blue-700 dark:bg-finance-blue-800 dark:text-finance-blue-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap ${isCollapsed && !isMobile ? "hidden" : ""}`}>
                    {item.label}
                  </span>
                  {activeItem === item.id && (
                    <motion.div
                      className={`ml-auto w-1.5 h-5 rounded-full bg-finance-blue-600 dark:bg-finance-blue-400 ${isCollapsed && !isMobile ? "hidden" : ""}`}
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div
            className={`p-4 border-t border-gray-100 dark:border-gray-700 ${isCollapsed && !isMobile ? "hidden" : ""}`}
          >
            <div className="bg-finance-blue-50 dark:bg-finance-blue-900/30 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-finance-blue-700 dark:text-finance-blue-300 mb-1">Need Help?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contact our support team for assistance</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default Sidebar

