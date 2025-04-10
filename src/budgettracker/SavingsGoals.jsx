import { useState, useEffect, useContext } from "react"
import { UserContext } from "../context/UserContext"
import { db } from "../config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button, Progress, Modal, Badge, Tabs } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from "@ant-design/icons"
import AddSavingsGoalModal from "./modals/AddSavingsGoalModal"
import AllocateToGoalModal from "./modals/AllocateToGoalModal"
import Confetti from "react-confetti"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"

const { TabPane } = Tabs

const SavingsGoals = () => {
  const { t } = useTranslation()
  const { user } = useContext(UserContext)
  const [savingsGoals, setSavingsGoals] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiColors, setConfettiColors] = useState(["#0c8de0", "#20b77c", "#f96a16"])
  const [goalStatus, setGoalStatus] = useState(() => {
    const savedStatus = localStorage.getItem("goalStatus")
    return savedStatus ? JSON.parse(savedStatus) : {}
  })
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Fetch savings goals
  useEffect(() => {
    if (user) {
      const fetchGoals = async () => {
        try {
          const goalsDoc = await getDoc(doc(db, "savingsGoals", user.uid))
          if (goalsDoc.exists()) {
            setSavingsGoals(goalsDoc.data().goals || [])
          }
        } catch (error) {
          console.error("Error fetching goals: ", error)
        }
      }
      fetchGoals()
    }
  }, [user])

  // Check goal status
  useEffect(() => {
    savingsGoals.forEach((goal) => {
      const percentage = goal.goalAmount ? Math.floor((goal.currentAmount / goal.goalAmount) * 100) : 0

      if (percentage >= 100 && !goalStatus[goal.goalName]?.completed) {
        handleGoalCompletion(goal)
      } else if (goal.currentAmount > goal.goalAmount && !goalStatus[goal.goalName]?.surpassed) {
        handleGoalSurpassed(goal)
      } else if (goal.deadline && new Date(goal.deadline) < new Date() && percentage < 100 && !goalStatus[goal.goalName]?.missed) {
        handleMissedDeadline(goal)
      }
    })
  }, [savingsGoals, goalStatus])

  const handleAddGoal = async (goal) => {
    try {
      const updatedGoals = [...savingsGoals, goal]
      setSavingsGoals(updatedGoals)
      await setDoc(doc(db, "savingsGoals", user.uid), { goals: updatedGoals })
    } catch (error) {
      console.error("Error adding goal: ", error)
    }
  }

  const handleAllocateToGoal = async (amount, goalName) => {
    try {
      const selectedGoal = savingsGoals.find((goal) => goal.goalName === goalName)
      const remainingToTarget = selectedGoal.goalAmount - (selectedGoal.currentAmount || 0)
      const amountToAllocate = Math.min(amount, remainingToTarget)

      const updatedGoals = savingsGoals.map((goal) => {
        if (goal.goalName === goalName) {
          return {
            ...goal,
            currentAmount: (goal.currentAmount || 0) + amountToAllocate,
          }
        }
        return goal
      })

      await setDoc(doc(db, "savingsGoals", user.uid), { goals: updatedGoals })
      setSavingsGoals(updatedGoals)

      if (amountToAllocate < amount) {
        Modal.info({
          content: t("savingsGoals.notifications.allocationSuccess.message", {
            amount: amountToAllocate,
            remaining: amount - amountToAllocate,
            source: "wallet",
          }),
        })
      }
    } catch (error) {
      console.error("Error allocating to goal: ", error)
    }
  }

  const handleGoalCompletion = (goal) => {
    setConfettiColors(["#4caf50", "#8bc34a", "#cddc39"])
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 8000)

    Modal.success({
      title: t("savingsGoals.notifications.goalCompleted.title"),
      content: t("savingsGoals.notifications.goalCompleted.message", { goalName: goal.goalName }),
      className: "dark:bg-gray-800 dark:text-white",
    })

    const updatedStatus = {
      ...goalStatus,
      [goal.goalName]: { ...goalStatus[goal.goalName], completed: true },
    }
    setGoalStatus(updatedStatus)
    localStorage.setItem("goalStatus", JSON.stringify(updatedStatus))
  }

  const handleGoalSurpassed = (goal) => {
    setConfettiColors(["#ff9800", "#ff5722", "#f44336"])
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)

    Modal.success({
      title: t("savingsGoals.notifications.goalSurpassed.title"),
      content: t("savingsGoals.notifications.goalSurpassed.message", { goalName: goal.goalName }),
      className: "dark:bg-gray-800 dark:text-white",
    })

    const updatedStatus = {
      ...goalStatus,
      [goal.goalName]: { ...goalStatus[goal.goalName], surpassed: true },
    }
    setGoalStatus(updatedStatus)
    localStorage.setItem("goalStatus", JSON.stringify(updatedStatus))
  }

  const handleMissedDeadline = (goal) => {
    Modal.warning({
      title: t("savingsGoals.notifications.goalMissed.title"),
      content: t("savingsGoals.notifications.goalMissed.message", { goalName: goal.goalName }),
      className: "dark:bg-gray-800 dark:text-white",
    })

    const updatedStatus = {
      ...goalStatus,
      [goal.goalName]: { ...goalStatus[goal.goalName], missed: true },
    }
    setGoalStatus(updatedStatus)
    localStorage.setItem("goalStatus", JSON.stringify(updatedStatus))
  }

  const renderGoalCard = (goal) => {
    const percentage = goal.goalAmount ? Math.floor((goal.currentAmount / goal.goalAmount) * 100) : 0
    const isCompleted = percentage >= 100

    return (
      <motion.div
        key={goal.goalName}
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 flex flex-col space-y-4"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate max-w-[70%]">
            {goal.goalName}
          </h3>
          {isCompleted ? (
            <Badge count={<CheckCircleOutlined style={{ color: "#52c41a" }} />} className="pulse-animation" />
          ) : (
            <Badge count={<ClockCircleOutlined style={{ color: "#1890ff" }} />} />
          )}
        </div>
        <Progress
          percent={percentage}
          status={isCompleted ? "success" : "active"}
          strokeColor={{
            from: "#108ee9",
            to: "#87d068",
          }}
          className="dark:text-white"
        />
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <span>${goal.currentAmount || 0} / ${goal.goalAmount}</span>
          <span>
            {goal.deadline
              ? t("savingsGoals.deadline") + ": " + new Date(goal.deadline).toLocaleDateString()
              : t("savingsGoals.noDeadline")}
          </span>
        </div>
      </motion.div>
    )
  }

  const activeGoals = savingsGoals.filter((goal) => {
    const percentage = goal.goalAmount ? Math.floor((goal.currentAmount / goal.goalAmount) * 100) : 0
    return percentage < 100
  })

  const completedGoals = savingsGoals.filter((goal) => {
    const percentage = goal.goalAmount ? Math.floor((goal.currentAmount / goal.goalAmount) * 100) : 0
    return percentage >= 100
  })

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative space-y-6 bg-gray-50 dark:bg-gray-900">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
            colors={confettiColors}
            tweenDuration={8000}
          />
        </div>
      )}

      <motion.div
        variants={itemVariants}
        className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col space-y-4"
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t("savingsGoals.title")}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{t("savingsGoals.subtitle")}</p>
        </div>
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
          className="bg-transparent hover:bg-finance-blue-50 dark:hover:bg-finance-blue-900/30 text-finance-blue-600 dark:text-finance-blue-400 border-2 border-dashed border-finance-blue-300 dark:border-finance-blue-700 hover:border-finance-blue-500 dark:hover:border-finance-blue-500"
          size="large"
        >
          {t("savingsGoals.addGoal")}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultActiveKey="active" className="savings-goals-tabs dark:text-white">
          <TabPane tab={t("savingsGoals.activeGoals")} key="active">
            <AnimatePresence>
              {activeGoals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGoals.map(renderGoalCard)}
                </div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <p className="text-gray-500 dark:text-gray-400">{t("savingsGoals.noActiveGoals")}</p>
                </div>
              )}
            </AnimatePresence>
          </TabPane>
          <TabPane tab={t("savingsGoals.completedGoals")} key="completed">
            <AnimatePresence>
              {completedGoals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map(renderGoalCard)}
                </div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <p className="text-gray-500 dark:text-gray-400">{t("savingsGoals.noCompletedGoals")}</p>
                </div>
              )}
            </AnimatePresence>
          </TabPane>
        </Tabs>
      </motion.div>

      <AddSavingsGoalModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddGoal} />
      <AllocateToGoalModal
        open={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSave={handleAllocateToGoal}
        goals={activeGoals}
      />
    </motion.div>
  )
}

export default SavingsGoals

