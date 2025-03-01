"use client"

import { useState, useContext, useEffect } from "react"
import CardDetails from "./CardDetails"
import WalletDetails from "./WalletDetails"
import AddDetailsModal from "./modals/AddDetailsModal"
import AddCardDetailsModal from "./modals/AddCardDetailsModal"
import { UserContext } from "../context/UserContext"
import { db } from "../config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { motion } from "framer-motion"

const IncomeSources = () => {
  const { user } = useContext(UserContext)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [cardDetails, setCardDetails] = useState(null)
  const [walletDetails, setWalletDetails] = useState(null)
  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (user) {
      const fetchDetails = async () => {
        const cardDoc = await getDoc(doc(db, "cardDetails", user.uid))
        const walletDoc = await getDoc(doc(db, "walletDetails", user.uid))
        const goalsDoc = await getDoc(doc(db, "savingsGoals", user.uid))

        if (cardDoc.exists()) {
          setCardDetails(cardDoc.data())
        }
        if (walletDoc.exists()) {
          setWalletDetails(walletDoc.data())
        }
        if (goalsDoc.exists()) {
          setGoals(goalsDoc.data().goals || [])
        }
      }
      fetchDetails()
    }
  }, [user])

  const handleAddCardDetails = async (details) => {
    await setDoc(doc(db, "cardDetails", user.uid), details)
    setCardDetails(details)
  }

  const handleAddWalletDetails = async (details) => {
    await setDoc(doc(db, "walletDetails", user.uid), details)
    setWalletDetails(details)
  }

  const setCardBalance = (newBalance) => {
    setCardDetails((prev) => ({ ...prev, balance: newBalance }))
  }

  const setWalletBalance = (newBalance) => {
    setWalletDetails((prev) => ({ ...prev, balance: newBalance }))
  }

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
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Income Sources</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your cards and wallet details</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-finance-blue-700 dark:text-finance-blue-400 px-2">My Card</h2>
          <CardDetails
            balance={cardDetails?.balance || "0.00"}
            cardHolder={cardDetails?.cardHolder || user?.displayName || "Card Holder"}
            validThru={cardDetails?.validThru || "12/23"}
            cardNumber={cardDetails?.cardNumber || "**** **** **** 1234"}
            onSetDetails={() => setIsCardModalOpen(true)}
            isDetailsSet={!!cardDetails}
            goals={goals}
            userId={user?.uid}
            setGoals={setGoals}
            setBalance={setCardBalance}
            setCardDetails={setCardDetails}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-finance-green-700 dark:text-finance-green-400 px-2">My Wallet</h2>
          <WalletDetails
            name={user?.displayName || "User"}
            balance={walletDetails?.balance || "0.00"}
            onSetDetails={() => setIsWalletModalOpen(true)}
            isDetailsSet={!!walletDetails}
            goals={goals}
            userId={user?.uid}
            setGoals={setGoals}
            setBalance={setWalletBalance}
          />
        </div>
      </motion.div>

      <AddCardDetailsModal
        open={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleAddCardDetails}
      />
      <AddDetailsModal
        open={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSave={handleAddWalletDetails}
      />
    </motion.div>
  )
}

export default IncomeSources

