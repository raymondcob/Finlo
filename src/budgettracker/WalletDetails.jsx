import { useState } from "react"
import { FaPiggyBank } from "react-icons/fa"
import AllocateToGoalModal from "./modals/AllocateToGoalModal"
import { db } from "../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { message } from "antd"

const WalletDetails = ({ name, balance, onSetDetails, isDetailsSet, goals, userId, setGoals, setBalance }) => {
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)

  const handleAllocateToGoal = async (amount, goalName) => {
    if (amount > balance) {
      message.error("The amount entered is higher than the available balance.")
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
        `Only $${amountToAllocate} was needed to complete this goal. The remaining $${
          amount - amountToAllocate
        } stays in your wallet.`,
      )
    }
  }

  return (
    <div className="w-full max-w-[460px] min-w-[300px] h-[283px] flex justify-center items-center relative p-[10px] box-border">
      <div className="w-full h-[240px] bg-gradient-to-b from-finance-green-700 to-finance-green-500 dark:from-finance-green-800 dark:to-finance-green-600 rounded-xl p-6 flex flex-col justify-between box-border shadow-lg relative">
        <div>
          <div className="font-title text-3xl font-inter font-semibold text-white mb-2">{name}'s Wallet</div>
        </div>
        <div>
          <div className="w-full h-[1px] bg-white/30 my-4" />
          <div className="text-[30px] font-inter font-semibold text-white/90">Cash Balance</div>
          <div className="text-[28px] font-inter font-semibold text-white">$ {balance}</div>
        </div>

        {/* Set Wallet Details Button */}
        <div className="flex justify-center">
          <button
            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full transition-colors duration-200 hover:bg-white/20 text-sm"
            onClick={onSetDetails}
            disabled={isDetailsSet}
          >
            {isDetailsSet ? "Balance Set" : "Set Initial Balance"}
          </button>
        </div>

        {/* Allocate to Goal Button */}
        {isDetailsSet && (
          <button
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            onClick={() => setIsAllocateModalOpen(true)}
            title="Allocate to Savings Goal"
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

