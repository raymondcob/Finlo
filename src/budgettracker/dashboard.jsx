import { useContext, useEffect, useState, useCallback } from "react"
import { UserContext } from "../context/UserContext"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { collection, query, where, getDocs, getDoc, doc, runTransaction, Timestamp } from "firebase/firestore"
import { db } from "../config/firebase"
import IncomeExpenseDoughnutChart from "./Charts/IncomeExpenseDoughnutChart"
import {
  FaWallet,
  FaCreditCard,
  FaPiggyBank,
  FaPlus,
  FaChartBar,
  FaEye,
  FaMoneyBillWave,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaChartLine,
  FaBullseye,
  FaHistory,
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaRegLightbulb,
} from "react-icons/fa"
import { Progress, Tooltip } from "antd"
import { useNavigate } from "react-router-dom"
import AddTransactionModal from "./modals/AddTransactionModal"
import toast from "react-hot-toast"

function DashBoard() {
  const { user } = useContext(UserContext)
  const { t, i18n } = useTranslation()
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    essentialExpenses: 0,
    lifestyleExpenses: 0,
    walletBalance: 0,
    cardBalance: 0,
    recentTransactions: [],
  })
  const navigate = useNavigate()
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [savingsGoals, setSavingsGoals] = useState([])
  const [budgetLimitsExist, setBudgetLimitsExist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchFinancialData = useCallback(async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      // Get all transactions for this user
      const allTransactionsSnap = await getDocs(query(collection(db, "transactions"), where("userId", "==", user.uid)))

      // Process transactions in memory with proper date handling
      const transactions = allTransactionsSnap.docs
        .map((doc) => {
          const data = doc.data()
          const timestamp = parseTransactionDate(data.date)?.getTime() || new Date().getTime()

          // Normalize the category: lowercase and replace spaces with no spaces
          const category = data.category?.toLowerCase().replace(/\s+/g, "") // Remove spaces

          // Define essential categories (normalized format)
          const essentialCategories = [
            "rent/mortgage",
            "utilities",
            "groceries",
            "transportation",
            "insurance",
            "medicalexpenses",
            "internet",
            "phonebill",
            "childcare",
            "loanpayments",
          ]

          // Determine category type using normalized comparison
          const categoryType = essentialCategories.includes(category) ? "essential" : "lifestyle"

          return {
            id: doc.id,
            ...data,
            amount: Number(data.amount),
            timestamp: timestamp,
            categoryType: categoryType,
            category: category, // Store normalized category
            provider: data.provider || t("transactions.untitled"),
            type: data.type || "unknown", // Ensure type is always defined
          }
        })
        .filter((transaction) => transaction.type !== "unknown") // Filter out invalid transactions
        .sort((a, b) => b.timestamp - a.timestamp)

      // Get the 5 most recent transactions with proper category handling
      const recentTransactions = transactions.slice(0, 5).map((transaction) => {
        // Keep the original transaction data
        const processedTransaction = {
          ...transaction,
          // Don't modify the original category key
          category: transaction.category,
          // Keep the original provider
          provider: transaction.provider,
        }

        return processedTransaction
      })

      // Calculate totals from all transactions with category tracking
      const totals = transactions.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount)
          switch (transaction.type.toLowerCase()) {
            case "income":
              acc.income += amount
              break
            case "expense":
              // Track expenses by category type
              if (transaction.categoryType === "essential") {
                acc.essentialExpenses += amount
              } else {
                acc.lifestyleExpenses += amount
              }
              acc.expenses += amount // Total expenses
              break
            case "savings":
              acc.savings += amount
              break
          }
          return acc
        },
        {
          income: 0,
          expenses: 0,
          essentialExpenses: 0,
          lifestyleExpenses: 0,
          savings: 0,
        },
      )

      // Fetch other data in parallel
      const [cardDoc, walletDoc, savingsGoalsDoc] = await Promise.all([
        getDoc(doc(db, "cardDetails", user.uid)),
        getDoc(doc(db, "walletDetails", user.uid)),
        getDoc(doc(db, "savingsGoals", user.uid)),
      ])

      // Get wallet and card details
      const cardDetails = cardDoc.exists() ? cardDoc.data() : null
      const walletDetails = walletDoc.exists() ? walletDoc.data() : null

      // Get savings goals
      const savingsGoals = savingsGoalsDoc.exists()
        ? savingsGoalsDoc.data().goals.map((goal, index) => ({
            id: goal.id || `goal-${index}`,
            ...goal,
            progress: goal.goalAmount > 0 ? (goal.currentAmount / goal.goalAmount) * 100 : 0, // Avoid division by zero
          }))
        : []
      setSavingsGoals(savingsGoals)

      // Calculate total savings from goals
      const totalSavingsFromGoals = savingsGoals.reduce((total, goal) => total + (goal.currentAmount || 0), 0)

      // Set financial data
      setFinancialData({
        totalBalance: Number(walletDetails?.balance || 0) + Number(cardDetails?.balance || 0),
        totalIncome: totals.income,
        totalExpenses: totals.expenses,
        essentialExpenses: totals.essentialExpenses,
        lifestyleExpenses: totals.lifestyleExpenses,
        totalSavings: totalSavingsFromGoals + totals.savings,
        walletBalance: Number(walletDetails?.balance || 0),
        cardBalance: Number(cardDetails?.balance || 0),
        recentTransactions: recentTransactions,
      })

      // Check budget limits
      const budgetLimitsDoc = await getDoc(doc(db, "budgetLimits", user.uid))
      setBudgetLimitsExist(budgetLimitsDoc.exists() && Object.keys(budgetLimitsDoc.data()).length > 0)

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching financial data:", error)
      toast.error(t("dashboard.error.fetchingData"))
      setIsLoading(false)
    }
  }, [user?.uid, t])

  useEffect(() => {
    fetchFinancialData()
  }, [fetchFinancialData])

  const greetingTime = () => {
    const date = new Date()
    const hour = date.getHours()
    let greeting

    if (hour < 12) {
      greeting = t("greetings.morning")
    } else if (hour < 18) {
      greeting = t("greetings.afternoon")
    } else {
      greeting = t("greetings.evening")
    }

    return t("dashboard.welcome", {
      greeting: greeting,
      username: user?.displayName || "User",
    })
  }

  const getTimeIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return <FaSun className="text-yellow-400 animate-spin-slow" />
    } else if (hour < 18) {
      return <FaCloudSun className="text-orange-400 animate-pulse" />
    } else {
      return <FaMoon className="text-blue-400 animate-bounce" />
    }
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

  const getFinancialInsights = (data) => {
    const insights = []
    if (data.totalExpenses > data.totalIncome * 0.8) {
      insights.push({
        text: t("dashboard.insights.expensesWarning"),
        icon: <FaExclamationTriangle className="text-amber-500" />,
        color: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
      })
    }
    if (data.totalSavings > 0) {
      insights.push({
        text: t("dashboard.insights.savingsProgress"),
        icon: <FaCheckCircle className="text-green-500" />,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
      })
    }
    if (!budgetLimitsExist) {
      insights.push({
        text: t("dashboard.insights.setBudgetLimits"),
        icon: <FaRegLightbulb className="text-blue-500" />,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
      })
    }

    if (insights.length === 0) {
      insights.push({
        text: t("dashboard.insights.goodFinances"),
        icon: <FaCheckCircle className="text-green-500" />,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
      })
    }

    return insights
  }

  const calculateHealthScore = (data) => {
    let score = 100;

    // Deduct points if total income is zero
    if (data.totalIncome === 0) {
      return 0; // Financial health is 0 if no income
    }

    // Deduct points based on expenses exceeding income
    if (data.totalExpenses > data.totalIncome) {
      score -= 30;
    }

    // Deduct points if savings are less than 10% of income
    if (data.totalSavings < data.totalIncome * 0.1) {
      score -= 20;
    }

    // Ensure the score is not negative
    return Math.max(score, 0);
  };

  const handleAddTransaction = async (data) => {
    if (!user?.uid) return

    try {
      const paymentMethod = data.paymentMethod.toLowerCase()
      const amount = Number(data.amount)

      let newBalance = 0

      await runTransaction(db, async (transaction) => {
        const collectionName = paymentMethod === "wallet" ? "walletDetails" : "cardDetails"
        const docRef = doc(db, collectionName, user.uid)
        const balanceDoc = await transaction.get(docRef)

        if (!balanceDoc.exists()) {
          throw new Error(`${collectionName} document does not exist!`)
        }

        const currentBalance = Number(balanceDoc.data().balance || 0)
        newBalance = data.type === "Income" ? currentBalance + amount : currentBalance - amount

        const transactionDoc = {
          ...data,
          userId: user.uid,
          date: data.date?.toDate?.() || data.date || new Date(),
          paymentMethod: paymentMethod,
          amount: amount,
        }

        transaction.update(docRef, { balance: newBalance })
        const transactionRef = doc(collection(db, "transactions"))
        transaction.set(transactionRef, transactionDoc)
      })

      // Fetch updated data after successful transaction
      await fetchFinancialData()
      setIsTransactionModalOpen(false)

      if (newBalance < 100) {
        toast.error(
          t("transactions.lowBalancealert", {
            balance: newBalance,
            method:
              paymentMethod === "wallet"
                ? t("transactions.payment.wallet").toLowerCase()
                : t("transactions.payment.card").toLowerCase(),
          }),
        )
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error(t("transactions.error"))
    }
  }

  const parseTransactionDate = (dateValue) => {
    try {
      if (dateValue?.toDate) {
        return dateValue.toDate()
      }
      if (typeof dateValue === "number") {
        const date = new Date(dateValue)
        if (!isNaN(date.getTime())) return date
      }
      if (typeof dateValue === "string") {
        const date = new Date(dateValue)
        if (!isNaN(date.getTime())) return date
      }
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue
      }

      console.error("Invalid date value:", dateValue)
      return null
    } catch (error) {
      console.error("Error parsing date:", error, "Value:", dateValue)
      return null
    }
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getHealthScoreBackground = (score) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Loading skeleton for the dashboard
  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm animate-pulse">
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-80"></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-80">
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sort savings goals by percentage completed in descending order
  const sortedSavingsGoals = savingsGoals
    .filter((goal) => goal.currentAmount < goal.goalAmount)
    .sort((a, b) => (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount))
    .slice(0, 3); // Take the top 3 goals

  // Take the last 3 recent transactions
  const recentTransactions = financialData.recentTransactions.slice(0, 3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-100 dark:bg-finance-blue-900/20 rounded-xl shadow-sm">
              {getTimeIcon()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-1.5">
                {greetingTime()}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-finance-blue-900/50 flex items-center justify-center">
                <FaWallet className="text-blue-600 dark:text-finance-blue-400 text-sm sm:text-base" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("dashboard.totalbalance")}
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
              ${financialData.totalBalance.toLocaleString()}
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <FaArrowUp className="text-green-600 dark:text-green-400 text-sm sm:text-base" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("dashboard.totalIncome")}
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
              ${financialData.totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <FaArrowDown className="text-red-600 dark:text-red-400 text-sm sm:text-base" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("dashboard.totalExpenses")}
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
              ${financialData.totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 dark:bg-amber-900/50 flex items-center justify-center">
                <FaPiggyBank className="text-yellow-600 dark:text-amber-400 text-sm sm:text-base" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("dashboard.totalSavings")}
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600 dark:text-amber-400">
              ${financialData.totalSavings.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <button
          onClick={() => setIsTransactionModalOpen(true)}
          className="flex flex-col items-center justify-center gap-4 p-7 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-finance-blue-900/30 flex items-center justify-center">
            <FaPlus className="text-blue-600 dark:text-finance-blue-400 text-xl" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Transaction
          </span>
        </button>

        <button
          onClick={() => navigate("/budget-limits")}
          className="flex flex-col items-center justify-center gap-4 p-7 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 group"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaChartBar className="text-green-600 dark:text-green-400 text-xl" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {budgetLimitsExist ? t("dashboard.quickactions.viewBudgets") : t("dashboard.quickactions.setBudgets")}
          </span>
        </button>

        <button
          onClick={() => navigate("/reports")}
          className="flex flex-col items-center justify-center gap-4 p-7 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 group"
        >
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaChartLine className="text-purple-600 dark:text-purple-400 text-xl" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("dashboard.quickactions.reports")}
          </span>
        </button>

        <button
          onClick={() => navigate("/income")}
          className="flex flex-col items-center justify-center gap-4 p-7 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-700 group"
        >
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaMoneyBillWave className="text-orange-600 dark:text-orange-400 text-xl" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("dashboard.quickactions.sources")}
          </span>
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-8 flex items-center gap-2">
            <FaChartBar className="text-blue-500" />
            {t("dashboard.incomevsexpenses")}
          </h3>
          <div className="flex items-center justify-center" style={{ height: "260px" }}>
            <div className="w-full max-w-[260px] aspect-square">
              <IncomeExpenseDoughnutChart userId={user?.uid} />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2">
            <FaHistory className="text-blue-500" />
            {t("dashboard.recentTransactions")}
          </h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          transaction.type === "Income" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <p className="font-medium text-gray-700 dark:text-gray-300">{transaction.provider}</p>
                    </div>
                    <div className="flex gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        {(() => {
                          const parsedDate = parseTransactionDate(transaction.date)
                          return parsedDate
                            ? parsedDate.toLocaleDateString(i18n.language, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : t("transactions.invalidDate")
                        })()}
                      </span>
                      <span className="capitalize flex items-center gap-1">
                        {transaction.type.toLowerCase() === "income" ? (
                          <FaArrowUp className="text-xs text-green-500" />
                        ) : (
                          <FaArrowDown className="text-xs text-red-500" />
                        )}
                        {t(`transactions.type.${transaction.type.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${transaction.type === "Income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "Income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <FaInfoCircle className="mx-auto text-gray-400 text-xl mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t("dashboard.noRecentTransactions")}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/transactions")}
            className="w-full mt-6 py-3 text-blue-600 dark:text-finance-blue-400 border border-blue-100 dark:border-finance-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-finance-blue-900/20 transition-colors text-sm font-medium"
          >
            {t("dashboard.buttons.showAllTransactions")}
          </button>
        </div>
      </motion.div>

      {/* Financial Insights and Goals */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Financial Insights */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2">
            <FaChartLine className="text-finance-blue-500" />
            {t("dashboard.insights.title")}
          </h3>

          <div className="space-y-4">
            {getFinancialInsights(financialData).map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl flex items-start gap-3 ${insight.bg} border ${insight.border}`}
              >
                <div className="mt-0.5">{insight.icon}</div>
                <p className={`${insight.color} text-sm`}>{insight.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.insights.financialHealth")}</p>
              <span className={`text-lg font-bold ${getHealthScoreColor(calculateHealthScore(financialData))}`}>
                {calculateHealthScore(financialData)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getHealthScoreBackground(calculateHealthScore(financialData))} rounded-full`}
                style={{ width: `${calculateHealthScore(financialData)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2">
            <FaBullseye className="text-finance-blue-500" />
            {t("savingsGoals.title")}
          </h3>
          <div className="space-y-5">
            {sortedSavingsGoals.length > 0 ? (
              sortedSavingsGoals.map((goal) => (
                <div key={goal.id} className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <Tooltip title={goal.goalName}>
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px] font-medium">
                        {goal.goalName}
                      </span>
                    </Tooltip>
                    <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                      ${goal.currentAmount.toLocaleString()} / ${goal.goalAmount.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round((goal.currentAmount / goal.goalAmount) * 100)}
                    strokeColor="#0c8de0"
                    size="small"
                    showInfo={false}
                    strokeWidth={3}
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("savingsGoals.progress", {
                        percentage: Math.round((goal.currentAmount / goal.goalAmount) * 100),
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <FaInfoCircle className="mx-auto text-gray-400 text-xl mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t("dashboard.noActiveGoals")}</p>
              </div>
            )}

            <button
              onClick={() => navigate("/savings-goals")}
              className="mt-4 w-full py-3 bg-transparent border border-finance-blue-100 dark:border-finance-blue-800 text-finance-blue-600 dark:text-finance-blue-400 rounded-xl hover:bg-finance-blue-50 dark:hover:bg-finance-blue-900/20 transition-all duration-200 text-sm font-medium"
            >
              {t("dashboard.buttons.manageSavingsGoals")}
            </button>
          </div>
        </div>
      </motion.div>

      <AddTransactionModal
        open={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        cardBalance={financialData.cardBalance}
        walletBalance={financialData.walletBalance}
      />
    </motion.div>
  )
}

export default DashBoard

