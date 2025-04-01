import { useState } from "react"
import { FaPiggyBank } from "react-icons/fa"
import AllocateToGoalModal from "./modals/AllocateToGoalModal"
import { db } from "../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { message } from "antd"
import { useTranslation } from "react-i18next"

const WalletDetails = ({ name, balance, onSetDetails, isDetailsSet, goals, userId, setGoals, setBalance }) => {
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)
  const { t } = useTranslation()

  const handleAllocateToGoal = async (amount, goalName) => {
    if (amount > balance) {
      message.error(t("savingsGoals.notifications.allocationError.message"))
      return
    }

    const selectedGoal = goals.find((goal) => goal.goalName === goalName)
    const remainingToTarget = selectedGoal.goalAmount - (selectedGoal.currentAmount || 0)
    const amountToAllocate = Math.min(amount, remainingToTarget)

    const updatedGoals = goals.map((goal) => {
      if (goal.goalName === goalName) {
        return {
          ...goal,
          currentAmount: (goal.currentAmount || 0) + amountToAllocate,
        }
      }
      return goal
    })

    const updatedBalance = balance - amountToAllocate

    // Update Firestore with the new balance and goals
    await setDoc(doc(db, "walletDetails", userId), { balance: updatedBalance })
    await setDoc(doc(db, "savingsGoals", userId), { goals: updatedGoals })

    setGoals(updatedGoals)
    setBalance(updatedBalance)

    if (amountToAllocate < amount) {
      message.info(
        t("savingsGoals.notifications.allocationSuccess.message", {
          amount: amountToAllocate,
          remaining: amount - amountToAllocate,
          source: t("transactions.payment.wallet").toLowerCase(),
        }),
      )
    }
  }

  return (
    <div className="w-full max-w-[460px] min-w-[300px] h-auto min-h-[283px] flex justify-center items-center relative p-[10px] box-border">
      <div className="w-full h-auto min-h-[240px] bg-gradient-to-b from-finance-green-700 to-finance-green-500 dark:from-finance-green-800 dark:to-finance-green-600 rounded-xl p-6 flex flex-col justify-between box-border shadow-lg relative">
        <div>
          <div className="font-title text-2xl sm:text-3xl font-inter font-semibold text-white mb-2 truncate">
            {t("incomesources.walletholder", { username: name })}
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-[1px] bg-white/30 my-4" />
          <div className="text-2xl sm:text-[30px] font-inter font-semibold text-white/90">
            {t("incomesources.cashbalance")}
          </div>
          <div className="text-2xl sm:text-[28px] font-inter font-semibold text-white">$ {balance}</div>
        </div>

        {/* Set Wallet Details Button */}
        <div className="flex justify-center mt-4">
          <button
            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full transition-colors duration-200 hover:bg-white/20 text-xs sm:text-sm whitespace-nowrap"
            onClick={onSetDetails}
            disabled={isDetailsSet}
          >
            {isDetailsSet ? t("incomesources.cashbalancedset") : t("incomesources.cashbalanceinitial")}
          </button>
        </div>

        {/* Allocate to Goal Button */}
        {isDetailsSet && (
          <button
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            onClick={() => setIsAllocateModalOpen(true)}
            title={t("incomesources.allocatetogoals")}
          >
            <FaPiggyBank className="text-white text-lg" />
          </button>
        )}
      </div>

      {/* Allocate Modal */}
      {isAllocateModalOpen && goals && (
        <AllocateToGoalModal
          open={isAllocateModalOpen}
          onClose={() => setIsAllocateModalOpen(false)}
          onSave={handleAllocateToGoal}
          goals={goals}
        />
      )}
    </div>
  )
}

export default WalletDetails

