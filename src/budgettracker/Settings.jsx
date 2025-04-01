import { useState, useContext } from "react"
import { UserContext } from "../context/UserContext"
import { motion } from "framer-motion"
import { FiUser, FiLock, FiHelpCircle, FiUpload } from "react-icons/fi"
import { auth } from "../config/firebase"
import { updateProfile, updateEmail, updatePassword } from "firebase/auth"
import { message } from "antd"
import emailjs from "@emailjs/browser"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const Settings = () => {
  const { t } = useTranslation()
  const { user } = useContext(UserContext)
  const [activeTab, setActiveTab] = useState("profile")
  const isGoogleUser = user?.providerData[0]?.providerId === "google.com"
  const [uploading, setUploading] = useState(false)

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
    { id: "profile", label: t("settings.tabs.profile"), icon: FiUser },
    { id: "security", label: t("settings.tabs.security"), icon: FiLock },
    { id: "help", label: t("settings.tabs.help"), icon: FiHelpCircle },
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    const displayName = e.target.fullName.value
    const photoFile = e.target.photo?.files[0]

    try {
      let photoURL = user?.photoURL

      if (photoFile && !isGoogleUser) {
        try {
          photoURL = await uploadImage(photoFile)
        } catch (error) {
          message.error(t("settings.notifications.profileUpdateFailed"))
          return
        }
      }

      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL }),
      })

      message.success(t("settings.notifications.profileUpdated"))
    } catch (error) {
      message.error(t("settings.notifications.profileUpdateFailed"))
      console.error(error)
    }
  }

  const handleSecurityUpdate = async (e) => {
    e.preventDefault()
    if (isGoogleUser) return

    try {
      const newEmail = e.target.newEmail?.value
      const newPassword = e.target.newPassword?.value
      const confirmPassword = e.target.confirmPassword?.value

      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          message.error(t("settings.security.passwordMismatch"))
          return
        }
        await updatePassword(auth.currentUser, newPassword)
        message.success(t("settings.notifications.passwordUpdated"))
      }

      if (newEmail && newEmail !== user.email) {
        await updateEmail(auth.currentUser, newEmail)
        message.success(t("settings.notifications.emailUpdated"))
      }

      e.target.reset()
    } catch (error) {
      message.error(error.message || t("settings.notifications.securityUpdateFailed"))
      console.error(error)
    }
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append("image", file)

    try {
      setUploading(true)
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        return data.data.url
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSupportSubmit = async (e) => {
    e.preventDefault()
    const form = e.target

    try {
      toast.loading(t("common.loading"))

      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        {
          user_email: user.email,
          user_name: user.displayName,
          subject: form.subject.value,
          message: form.message.value,
        },
        EMAIL_PUBLIC_KEY,
      )

      toast.dismiss()
      toast.success(t("settings.help.messageSent"))
      form.reset()
    } catch (error) {
      toast.dismiss()
      toast.error(t("settings.help.messageError"))
      console.error("Email error:", error)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">{t("settings.title")}</h1>
            <p className="text-gray-600 dark:text-gray-300">{t("settings.subtitle")}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-finance-blue-50 text-finance-blue-700 dark:bg-finance-blue-900/30 dark:text-finance-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {t("settings.profile.title")}
                </h2>

                {isGoogleUser && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {t("settings.profile.googleAccountNotice")}{" "}
                      <a
                        href="https://myaccount.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {t("settings.profile.googleAccountLink")}
                      </a>{" "}
                      {t("settings.profile.toModify")}
                    </p>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="relative w-20 h-20">
                      <div className="w-20 h-20 rounded-full bg-finance-blue-100 dark:bg-finance-blue-900/50 flex items-center justify-center overflow-hidden border-2 border-finance-blue-200 dark:border-finance-blue-800">
                        <img
                          src={user?.photoURL || "/user.svg"}
                          alt="User"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/user.svg"
                          }}
                        />
                      </div>
                      {!isGoogleUser && (
                        <label className="absolute bottom-0 right-0 bg-finance-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-finance-blue-700 transition-colors shadow-md">
                          <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                // Preview image
                                const reader = new FileReader()
                                reader.onload = (event) => {
                                  const img = e.target.parentElement.parentElement.querySelector("img")
                                  img.src = event.target.result
                                }
                                reader.readAsDataURL(e.target.files[0])
                              }
                            }}
                          />
                          <FiUpload className="w-4 h-4" />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium dark:text-white">{user?.displayName || "User"}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{user?.email || ""}</p>
                      {isGoogleUser && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t("settings.profile.profilePicture")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("settings.profile.fullName")}
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-finance-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      defaultValue={user?.displayName || ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("settings.profile.emailAddress")}
                    </label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-finance-blue-600 text-white rounded-xl hover:bg-finance-blue-700 focus:outline-none focus:ring-2 focus:ring-finance-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      {t("settings.profile.saveChanges")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && !isGoogleUser && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {t("settings.security.title")}
                </h2>
                <form onSubmit={handleSecurityUpdate} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium dark:text-white mb-2">{t("settings.security.updateEmail")}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("settings.security.newEmailAddress")}
                        </label>
                        <input
                          name="newEmail"
                          type="email"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-finance-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={t("settings.security.newEmailAddress")}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium dark:text-white mb-2">
                      {t("settings.security.changePassword")}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("settings.security.newPassword")}
                        </label>
                        <input
                          name="newPassword"
                          type="password"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-finance-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={t("settings.security.newPassword")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("settings.security.confirmNewPassword")}
                        </label>
                        <input
                          name="confirmPassword"
                          type="password"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-finance-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={t("settings.security.confirmNewPassword")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-finance-blue-600 text-white rounded-xl hover:bg-finance-blue-700 focus:outline-none focus:ring-2 focus:ring-finance-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      {t("settings.security.updateSecuritySettings")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && isGoogleUser && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {t("settings.security.googleSecurityNotice")}{" "}
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {t("settings.security.googleSecurityLink")}
                  </a>{" "}
                  {t("settings.security.toModify")}
                </p>
              </div>
            )}

            {activeTab === "help" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t("settings.help.title")}</h2>

                {/* Essential FAQs */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-4 shadow-sm border border-gray-100 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">{t("settings.help.quickHelp")}</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-finance-blue-600 dark:text-finance-blue-300">
                        {t("settings.help.faqs.addTransaction.question")}
                      </h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                        {t("settings.help.faqs.addTransaction.answer")}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-finance-blue-600 dark:text-finance-blue-300">
                        {t("settings.help.faqs.setupWalletCard.question")}
                      </h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                        {t("settings.help.faqs.setupWalletCard.answer")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simple Contact Form */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    {t("settings.help.contactSupport")}
                  </h3>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("settings.help.subject")}
                      </label>
                      <select
                        name="subject"
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-finance-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">{t("settings.help.subjectPlaceholder")}</option>
                        <option value="account">{t("settings.help.subjectOptions.account")}</option>
                        <option value="transaction">{t("settings.help.subjectOptions.transaction")}</option>
                        <option value="feature">{t("settings.help.subjectOptions.feature")}</option>
                        <option value="other">{t("settings.help.subjectOptions.other")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("settings.help.message")}
                      </label>
                      <textarea
                        name="message"
                        required
                        rows="4"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-finance-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t("settings.help.messagePlaceholder")}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-finance-blue-600 text-white rounded-xl hover:bg-finance-blue-700 focus:outline-none focus:ring-2 focus:ring-finance-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      {t("settings.help.sendMessage")}
                    </button>
                  </form>
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

