import { useState, useContext, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { UserContext } from "../context/UserContext"
import { db } from "../config/firebase"
import CardDetails from "./CardDetails"
import WalletDetails from "./WalletDetails"
import AddDetailsModal from "./modals/AddDetailsModal"
import AddCardDetailsModal from "./modals/AddCardDetailsModal"
import { useTranslation } from "react-i18next"

const IncomeSources = () => {
  const { user } = useContext(UserContext)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [cardDetails, setCardDetails] = useState(null)
  const [walletDetails, setWalletDetails] = useState(null)
  const [goals, setGoals] = useState([])
  const [isBalanceSet, setIsBalanceSet] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (user) {
      const fetchDetails = async () => {
        try {
          const cardDoc = await getDoc(doc(db, "cardDetails", user.uid))
          const walletDoc = await getDoc(doc(db, "walletDetails", user.uid))
          const goalsDoc = await getDoc(doc(db, "savingsGoals", user.uid))

          if (cardDoc.exists()) {
            const cardData = cardDoc.data()
            setCardDetails(cardData)
            setIsBalanceSet(!!cardData.balance)
            if (Number(cardData.balance) < 100) {
              toast.error(t("incomesources.cardbalancealert", { balance: cardData.balance }))
            }
          }

          if (walletDoc.exists()) {
            const walletData = walletDoc.data()
            setWalletDetails(walletData)
            if (Number(walletData.balance) < 100) {
              toast.error(t("incomesources.walletbalancealert", { balance: walletData.balance }))
            }
          }

          if (goalsDoc.exists()) {
            setGoals(goalsDoc.data().goals || [])
          }
        } catch (error) {
          console.error("Error fetching details: ", error)
        }
      }
      fetchDetails()
    }
  }, [user, t])

  const handleAddCardDetails = async (details) => {
    await setDoc(doc(db, "cardDetails", user.uid), details)
    setCardDetails(details)
    setIsBalanceSet(!!details.balance)
  }

  const handleAddWalletDetails = async (details) => {
    await setDoc(doc(db, "walletDetails", user.uid), details)
    setWalletDetails(details)
  }

  const setCardBalance = async (newBalance) => {
    setCardDetails((prev) => ({ ...prev, balance: newBalance }))
    if (Number(newBalance) < 100) {
      toast.error(t("incomesources.cardbalancealert", { balance: newBalance }))
    }
    await setDoc(doc(db, "cardDetails", user.uid), {
      ...cardDetails,
      balance: newBalance,
    })
  }

  const setWalletBalance = async (newBalance) => {
    setWalletDetails((prev) => ({ ...prev, balance: newBalance }))
    if (Number(newBalance) < 100) {
      toast.error(t("incomesources.walletbalancealert", { balance: newBalance }))
    }
    await setDoc(doc(db, "walletDetails", user.uid), {
      ...walletDetails,
      balance: newBalance,
    })
  }

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-4">
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm mb-6">
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
          {t(
            "incomesources.cardManagementNotice",
            "Currently, this app supports managing only one card (credit or debit) at a time. If you want to track both, you can manage them as a single card by combining their balances. We are actively working on adding support for multiple cards in future updates."
          )}
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          {t("incomesources.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{t("incomesources.subtitle")}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 flex flex-col">
          <h2 className="text-xl font-semibold text-finance-blue-700 dark:text-finance-blue-400 px-2 self-start">
            {t("incomesources.mycard")}
          </h2>
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
        <div className="space-y-4 flex flex-col">
          <h2 className="text-xl font-semibold text-finance-green-700 dark:text-finance-green-400 px-2 self-start">
            {t("incomesources.mywallet")}
          </h2>
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
        isBalanceSet={isBalanceSet}
        cardDetails={cardDetails}
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

