import { useState, useContext } from "react"
import { UserContext } from "../context/UserContext"
import { motion } from "framer-motion"
import { FiUser, FiLock, FiBell, FiDollarSign, FiGlobe, FiHelpCircle } from "react-icons/fi"

const Settings = () => {
  const { user } = useContext(UserContext)
  const [activeTab, setActiveTab] = useState("profile")

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

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "security", label: "Security", icon: FiLock },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "preferences", label: "Preferences", icon: FiDollarSign },
    { id: "language", label: "Language", icon: FiGlobe },
    { id: "help", label: "Help & Support", icon: FiHelpCircle },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-finance-blue-50 text-finance-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-finance-blue-100 flex items-center justify-center text-finance-blue-700 text-2xl font-bold">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user?.displayName || "User"}</h3>
                      <p className="text-gray-500">{user?.email || ""}</p>
                      <button className="mt-2 px-3 py-1 bg-finance-blue-50 text-finance-blue-700 rounded-lg hover:bg-finance-blue-100">
                        Change Profile Picture
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent"
                        defaultValue={user?.displayName || ""}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent"
                        defaultValue={user?.email || ""}
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="pt-4">
                      <button className="px-4 py-2 bg-finance-blue-600 text-white rounded-lg hover:bg-finance-blue-700">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-finance-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="pt-2">
                        <button className="px-4 py-2 bg-finance-blue-600 text-white rounded-lg hover:bg-finance-blue-700">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Enhance your account security</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <button className="px-3 py-1.5 bg-finance-blue-50 text-finance-blue-700 rounded-lg hover:bg-finance-blue-100">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "profile" && activeTab !== "security" && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">This section is under development</p>
                  <div className="bg-finance-blue-50 p-4 rounded-lg">
                    <p className="text-finance-blue-700">Coming soon!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Settings

