import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button, Progress, Modal, Badge, Tabs } from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AddSavingsGoalModal from "./modals/AddSavingsGoalModal";
import AllocateToGoalModal from "./modals/AllocateToGoalModal";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

const { TabPane } = Tabs;

const SavingsGoals = () => {
  const { user } = useContext(UserContext);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [goalStatus, setGoalStatus] = useState(() => {
    const savedStatus = localStorage.getItem("goalStatus");
    return savedStatus ? JSON.parse(savedStatus) : {};
  });

  useEffect(() => {
    if (user) {
      const fetchGoals = async () => {
        try {
          const goalsDoc = await getDoc(doc(db, "savingsGoals", user.uid));
          if (goalsDoc.exists()) {
            setSavingsGoals(goalsDoc.data().goals || []);
          }
        } catch (error) {
          console.error("Error fetching goals: ", error);
        }
      };
      fetchGoals();
    }
  }, [user]);

  useEffect(() => {
    savingsGoals.forEach((goal) => {
      const percentage = goal.goalAmount
        ? Math.floor((goal.currentAmount / goal.goalAmount) * 100)
        : 0;

      if (percentage >= 100 && !goalStatus[goal.goalName]?.completed) {
        handleGoalCompletion(goal);
      } else if (
        goal.currentAmount > goal.goalAmount &&
        !goalStatus[goal.goalName]?.surpassed
      ) {
        handleGoalSurpassed(goal);
      } else if (
        new Date(goal.deadline) < new Date() &&
        percentage < 100 &&
        !goalStatus[goal.goalName]?.missed
      ) {
        handleMissedDeadline(goal);
      }
    });
  }, [savingsGoals, goalStatus]);

  const handleAddGoal = async (goal) => {
    try {
      const updatedGoals = [...savingsGoals, goal];
      setSavingsGoals(updatedGoals);
      await setDoc(doc(db, "savingsGoals", user.uid), { goals: updatedGoals });
    } catch (error) {
      console.error("Error adding goal: ", error);
    }
  };

  const handleAllocateToGoal = async (amount, goalName) => {
    try {
      const updatedGoals = savingsGoals.map((goal) => {
        if (goal.goalName === goalName) {
          const remainingAmount = goal.goalAmount - (goal.currentAmount || 0);
          const amountToAllocate = Math.min(amount, remainingAmount);
          return {
            ...goal,
            currentAmount: (goal.currentAmount || 0) + amountToAllocate,
          };
        }
        return goal;
      });

      await setDoc(doc(db, "savingsGoals", user.uid), { goals: updatedGoals });
      setSavingsGoals(updatedGoals);
    } catch (error) {
      console.error("Error allocating to goal: ", error);
    }
  };

  const handleGoalCompletion = (goal) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    Modal.success({
      title: "Congratulations!",
      content: `You've reached your savings goal for ${goal.goalName}!`,
    });
    const updatedStatus = {
      ...goalStatus,
      [goal.goalName]: { ...goalStatus[goal.goalName], completed: true },
    };
    setGoalStatus(updatedStatus);
    localStorage.setItem("goalStatus", JSON.stringify(updatedStatus));
  };

  const handleGoalSurpassed = (goal) => {
    Modal.success({
      title: "Amazing!",
      content: `You've surpassed your savings goal for ${goal.goalName}!`,
    });
    const updatedStatus = {
      ...goalStatus,
      [goal.goalName]: { ...goalStatus[goal.goalName], surpassed: true },
    };
    setGoalStatus(updatedStatus);
    localStorage.setItem("goalStatus", JSON.stringify(updatedStatus));
  };

  const handleMissedDeadline = (goal) => {
    Modal.warning({
      title: "Goal Missed",
      content: `You didn't meet your savings goal for ${goal.goalName}, but you're making progress!`,
    });
    const updatedStatus = {
      ...goalStatus,
      [goal.goalName]: { ...goalStatus[goal.goalName], missed: true },
    };
    setGoalStatus(updatedStatus);
    localStorage.setItem("goalStatus", JSON.stringify(updatedStatus));
  };

  const renderGoalCard = (goal) => {
    const percentage = goal.goalAmount
      ? Math.floor((goal.currentAmount / goal.goalAmount) * 100)
      : 0;
    const isCompleted = percentage >= 100;

    return (
      <motion.div
        key={goal.goalName}
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {goal.goalName}
          </h3>
          {isCompleted ? (
            <Badge
              count={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          ) : (
            <Badge
              count={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
            />
          )}
        </div>
        <Progress
          percent={percentage}
          status={isCompleted ? "success" : "active"}
          strokeColor={{
            from: "#108ee9",
            to: "#87d068",
          }}
        />
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            ${goal.currentAmount || 0} / ${goal.goalAmount}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {goal.deadline
              ? `Deadline: ${new Date(goal.deadline).toLocaleDateString()}`
              : "No deadline"}
          </span>
        </div>
      </motion.div>
    );
  };

  const activeGoals = savingsGoals.filter((goal) => {
    const percentage = goal.goalAmount
      ? Math.floor((goal.currentAmount / goal.goalAmount) * 100)
      : 0;
    return percentage < 100;
  });

  const completedGoals = savingsGoals.filter((goal) => {
    const percentage = goal.goalAmount
      ? Math.floor((goal.currentAmount / goal.goalAmount) * 100)
      : 0;
    return percentage >= 100;
  });

  return (
    <div className="relative">
      {showConfetti && (
        <div className="absolute inset-0 z-50">
          <Confetti />
        </div>
      )}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Savings Goals
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Savings Goal
        </Button>
      </div>

      <Tabs defaultActiveKey="active" className="savings-goals-tabs">
        <TabPane tab="Active Goals" key="active">
          <AnimatePresence>
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.map(renderGoalCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No active savings goals. Click "Add Savings Goal" to get
                  started!
                </p>
              </div>
            )}
          </AnimatePresence>
        </TabPane>
        <TabPane tab="Completed Goals" key="completed">
          <AnimatePresence>
            {completedGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedGoals.map(renderGoalCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No completed savings goals yet. Keep saving!
                </p>
              </div>
            )}
          </AnimatePresence>
        </TabPane>
      </Tabs>

      <AddSavingsGoalModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddGoal}
      />
      <AllocateToGoalModal
        open={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSave={handleAllocateToGoal}
        goals={activeGoals}
      />
    </div>
  );
};

export default SavingsGoals;
