"use client"

import { useContext } from "react"
import { UserContext } from "../context/UserContext"
import { motion } from "framer-motion"

function DashBoard() {
  const { user } = useContext(UserContext)

  const greetingTime = () => {
    const date = new Date()
    const hour = date.getHours()
    if (hour < 12) {
      return "Good Morning"
    }
    if (hour < 18) {
      return "Good Afternoon"
    }
    return "Good Evening"
  }

  const username = user?.displayName || "User"

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-800">
          {greetingTime()}, <span className="text-finance-blue-600">{username}!</span>
        </h1>
        <h5 className="text-sm text-gray-500 mb-4">Welcome to your financial dashboard</h5>

        <div className="bg-finance-blue-50 p-4 rounded-lg border border-finance-blue-100">
          <p className="text-finance-blue-700">
            Track your finances, manage transactions, and view reports all in one place.
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full py-2 px-4 bg-finance-blue-50 text-finance-blue-700 rounded-lg hover:bg-finance-blue-100 transition-colors duration-200 text-left">
              Add Transaction
            </button>
            <button className="w-full py-2 px-4 bg-finance-green-50 text-finance-green-700 rounded-lg hover:bg-finance-green-100 transition-colors duration-200 text-left">
              View Reports
            </button>
            <button className="w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left">
              Manage Income Sources
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Grocery Shopping</span>
              <span className="text-sm font-medium text-red-500">-$45.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Salary Deposit</span>
              <span className="text-sm font-medium text-green-500">+$2,500.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utility Bill</span>
              <span className="text-sm font-medium text-red-500">-$120.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Financial Tips</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a budget and track your expenses to improve your financial health.
          </p>
          <div className="bg-finance-blue-50 p-3 rounded-lg">
            <p className="text-xs text-finance-blue-700">
              Did you know? Setting aside just 10% of your income can significantly improve your long-term financial
              stability.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DashBoard;

