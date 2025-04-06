import { useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AiFillHome } from "react-icons/ai";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaFileInvoiceDollar, FaChartBar } from "react-icons/fa";
import { GiWallet } from "react-icons/gi";
import { IoMdSettings } from "react-icons/io";
import { PageTitleContext } from "../context/PageTitleContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PiTipJarLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";

const Sidebar = ({ isOpen, onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setPageTitle } = useContext(PageTitleContext);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const path = location.pathname.split("/")[1] || "dashboard";
    setActiveItem(path);

    const menuItem = menuItems.find((item) => item.id === path);
    if (menuItem) {
      setPageTitle(menuItem.label);
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname, setPageTitle]);

  const menuItems = [
    {
      id: "dashboard",
      label: t("navigation.dashboard"),
      icon: AiFillHome,
      path: "/dashboard",
    },
    {
      id: "transactions",
      label: t("navigation.transactions"),
      icon: FaMoneyBillTransfer,
      path: "/transactions",
    },
    {
      id: "reports",
      label: t("navigation.reports"),
      icon: FaFileInvoiceDollar,
      path: "/reports",
    },
    {
      id: "income",
      label: t("navigation.income"),
      icon: GiWallet,
      path: "/income",
    },
    {
      id: "budget-limits",
      label: t("navigation.budgetLimits"),
      icon: FaChartBar,
      path: "/budget-limits",
    },
    {
      id: "savings-goals",
      label: t("navigation.savingsGoals"),
      icon: PiTipJarLight,
      path: "/savings-goals",
    },
    {
      id: "settings",
      label: t("navigation.settings"),
      icon: IoMdSettings,
      path: "/settings",
    },
  ];

  const handleMenuClick = (path, id, label) => {
    navigate(path);
    setActiveItem(id);
    setPageTitle(label);
    if (isMobile) {
      onMenuClick();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const sidebarVariants = {
    open: {
      width: isCollapsed ? "5rem" : "16rem",
      transition: { duration: 0.2, ease: "easeOut" },
    },
    closed: {
      width: "0rem",
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onMenuClick}
          style={{ backdropFilter: "blur(2px)" }}
        />
      )}

      <AnimatePresence>
        <motion.div
          className="fixed inset-y-0 left-0 z-30 md:relative md:z-0 min-h-[90vh] bg-gradient-to-b from-white to-gray-50 shadow-lg flex flex-col dark:from-gray-800 dark:to-gray-900 dark:shadow-xl transition-all duration-200 ease-in-out overflow-hidden"
          initial={isMobile ? "closed" : "open"}
          animate={isOpen || !isMobile ? "open" : "closed"}
          variants={sidebarVariants}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isMobile ? (
                <img
                  src="/favicon.ico"
                  alt="Finlo"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-finance-blue-500 to-finance-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  FL
                </div>
              )}
              {(!isCollapsed || isMobile) && (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Finlo
                </h2>
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
                      ? "bg-gradient-to-r from-finance-blue-100 to-finance-blue-200 text-finance-blue-700 dark:from-finance-blue-800 dark:to-finance-blue-900 dark:text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() =>
                    handleMenuClick(item.path, item.id, item.label)
                  }
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      activeItem === item.id
                        ? "bg-gradient-to-r from-finance-blue-500 to-finance-blue-600 text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`font-medium whitespace-nowrap ${
                      isCollapsed && !isMobile ? "hidden" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                  {activeItem === item.id && (
                    <motion.div
                      className={`ml-auto w-1.5 h-5 rounded-full bg-finance-blue-600 dark:bg-finance-blue-400 ${
                        isCollapsed && !isMobile ? "hidden" : ""
                      }`}
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
