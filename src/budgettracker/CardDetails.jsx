import { useState, useEffect } from "react"
import { FaPiggyBank } from "react-icons/fa"
import { FcSimCardChip } from "react-icons/fc";
import AllocateToGoalModal from "./modals/AllocateToGoalModal"
import { db } from "../config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { message } from "antd"

const CardDetails = ({
  balance,
  cardHolder,
  validThru,
  cardNumber,
  onSetDetails,
  isDetailsSet,
  goals,
  userId,
  setGoals,
  setBalance,
  setCardDetails,
}) => {
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const cardDoc = await getDoc(doc(db, "cardDetails", userId))
        if (cardDoc.exists()) {
          const data = cardDoc.data()
          setCardDetails(data)
        }
      } catch (error) {
        console.error("Error fetching card details: ", error)
      }
    }

    if (userId) {
      fetchCardDetails()
    }
  }, [userId, setCardDetails])

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
    await setDoc(doc(db, "cardDetails", userId), {
      balance: updatedBalance,
      cardHolder,
      validThru,
      cardNumber,
    })
    await setDoc(doc(db, "savingsGoals", userId), { goals: updatedGoals })

    setGoals(updatedGoals)
    setBalance(updatedBalance)

    if (amountToAllocate < amount) {
      message.info(
        `Only $${amountToAllocate} was needed to complete this goal. The remaining $${
          amount - amountToAllocate
        } stays in your card.`,
      )
    }
  }

  return (
    <div className="w-full max-w-[445px] h-[283px] rounded-[20px] bg-gradient-to-r from-finance-blue-800 to-finance-blue-500 dark:from-finance-blue-900 dark:to-finance-blue-700 p-6 flex flex-col justify-between box-border shadow-lg relative">
      {/* Balance Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white text-2xl font-lato font-normal mb-2">Balance</span>
          <span className="text-white text-[22px] font-inter font-semibold">$ {balance}</span>
        </div>
        {/* Set Card Details Button in the Same Row as Balance */}
        <button
          className=" mr-2 px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full transition-colors duration-200 hover:bg-white/20 text-sm"
          onClick={onSetDetails}
          disabled={isDetailsSet}
        >
          {isDetailsSet ? "Card Details Set" : "Set Card Details"}
        </button>
      </div>

      {/* Chip Image */}
      <div className="self-end">
        <FcSimCardChip className="text-white text-4xl w-[70.87px] h-[57.28px]" />
      </div>

      {/* Card Details Section */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div>
            <div className="text-white/70 text-[16px] font-inter font-semibold mb-1">CARD HOLDER</div>
            <div className="text-white text-lg font-inter font-medium">{cardHolder}</div>
          </div>
          <div>
            <div className="text-white/70 text-[16px] font-inter font-semibold mb-1">VALID THRU</div>
            <div className="text-white text-lg font-inter font-medium">{validThru}</div>
          </div>
        </div>

        {/* Card Number */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-2 rounded-[10px]">
          <span className="text-white text-[18px] font-inter font-semibold">{cardNumber}</span>
          <img
            src="https://dashboard.codeparrot.ai/api/image/Z58GOjRi7Jes38uz/group-17.png"
            alt="Card Logo"
            className="w-[70px] h-[45px]"
          />
        </div>
      </div>

      {/* Allocate to Goal Button */}
      {isDetailsSet && (
        <button
          className="absolute top-1 right-2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          onClick={() => setIsAllocateModalOpen(true)}
          title="Allocate to Savings Goal"
        >
          <FaPiggyBank className="text-white text-lg" />
        </button>
      )}

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

export default CardDetails

