import { useContext, useEffect, useState, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import IncomeExpenseDoughnutChart from "./Charts/IncomeExpenseDoughnutChart";
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
} from "react-icons/fa";
import { Progress } from "antd";
import { useNavigate } from "react-router-dom";
import AddTransactionModal from "./modals/AddTransactionModal";
import toast from "react-hot-toast";

function DashBoard() {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation();
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
  });
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [budgetLimitsExist, setBudgetLimitsExist] = useState(false);

  const fetchFinancialData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Get all transactions for this user
      const allTransactionsSnap = await getDocs(
        query(collection(db, "transactions"), where("userId", "==", user.uid))
      );

      // Process transactions in memory with proper date handling
      const transactions = allTransactionsSnap.docs
        .map((doc) => {
          const data = doc.data();
          // Convert any date format to timestamp in milliseconds
          const dateValue = data.date;
          let timestamp;

          if (dateValue instanceof Timestamp) {
            timestamp = dateValue.toMillis();
          } else if (typeof dateValue === "object" && dateValue.toDate) {
            timestamp = dateValue.toDate().getTime();
          } else if (typeof dateValue === "string") {
            timestamp = new Date(dateValue).getTime();
          } else if (typeof dateValue === "number") {
            timestamp = dateValue;
          } else {
            timestamp = new Date().getTime();
          }

          // Normalize the category: lowercase and replace spaces with no spaces
          const category = data.category?.toLowerCase().replace(/\s+/g, ""); // Remove spaces

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
          ];

          // Determine category type using normalized comparison
          const categoryType = essentialCategories.includes(category)
            ? "essential"
            : "lifestyle";

          // Debug log to check category normalization
          console.log("Category processing:", {
            original: data.category,
            normalized: category,
            type: categoryType,
          });

          return {
            id: doc.id,
            ...data,
            amount: Number(data.amount),
            timestamp: timestamp,
            categoryType: categoryType,
            category: category, // Store normalized category
            provider: data.provider || t("transactions.untitled"),
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      // Get the 5 most recent transactions with proper category handling
      const recentTransactions = transactions.slice(0, 5).map((transaction) => {
        // Keep the original transaction data
        const processedTransaction = {
          ...transaction,
          // Don't modify the original category key
          category: transaction.category,
          // Keep the original provider
          provider: transaction.provider,
        };

        return processedTransaction;
      });

      // Calculate totals from all transactions with category tracking
      const totals = transactions.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount);
          switch (transaction.type.toLowerCase()) {
            case "income":
              acc.income += amount;
              break;
            case "expense":
              // Track expenses by category type
              if (transaction.categoryType === "essential") {
                acc.essentialExpenses += amount;
              } else {
                acc.lifestyleExpenses += amount;
              }
              acc.expenses += amount; // Total expenses
              break;
            case "savings":
              acc.savings += amount;
              break;
          }
          return acc;
        },
        {
          income: 0,
          expenses: 0,
          essentialExpenses: 0,
          lifestyleExpenses: 0,
          savings: 0,
        }
      );

      // Fetch other data in parallel
      const [cardDoc, walletDoc, savingsGoalsDoc] = await Promise.all([
        getDoc(doc(db, "cardDetails", user.uid)),
        getDoc(doc(db, "walletDetails", user.uid)),
        getDoc(doc(db, "savingsGoals", user.uid)),
      ]);

      // Get wallet and card details
      const cardDetails = cardDoc.exists() ? cardDoc.data() : null;
      const walletDetails = walletDoc.exists() ? walletDoc.data() : null;

      // Get savings goals
      const savingsGoals = savingsGoalsDoc.exists()
        ? savingsGoalsDoc.data().goals.map((goal, index) => ({
            id: goal.id || `goal-${index}`,
            ...goal,
            progress: (goal.currentAmount / goal.goalAmount) * 100,
          }))
        : [];
      setSavingsGoals(savingsGoals);

      // Calculate total savings from goals
      const totalSavingsFromGoals = savingsGoals.reduce(
        (total, goal) => total + (goal.currentAmount || 0),
        0
      );

      // Set financial data
      setFinancialData({
        totalBalance:
          Number(walletDetails?.balance || 0) +
          Number(cardDetails?.balance || 0),
        totalIncome: totals.income,
        totalExpenses: totals.expenses,
        essentialExpenses: totals.essentialExpenses,
        lifestyleExpenses: totals.lifestyleExpenses,
        totalSavings: totalSavingsFromGoals + totals.savings,
        walletBalance: Number(walletDetails?.balance || 0),
        cardBalance: Number(cardDetails?.balance || 0),
        recentTransactions: recentTransactions,
      });

      // Check budget limits
      const budgetLimitsDoc = await getDoc(doc(db, "budgetLimits", user.uid));
      setBudgetLimitsExist(
        budgetLimitsDoc.exists() &&
          Object.keys(budgetLimitsDoc.data()).length > 0
      );
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error(t("dashboard.error.fetchingData"));
    }
  }, [user?.uid, t]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const greetingTime = () => {
    const date = new Date();
    const hour = date.getHours();
    let greeting;

    if (hour < 12) {
      greeting = t("greetings.morning");
    } else if (hour < 18) {
      greeting = t("greetings.afternoon");
    } else {
      greeting = t("greetings.evening");
    }

    return t("dashboard.welcome", {
      greeting: greeting,
      username: user?.displayName || "User",
    });
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return <FaSun className="text-yellow-400 animate-spin-slow" />;
    } else if (hour < 18) {
      return <FaCloudSun className="text-orange-400 animate-pulse" />;
    } else {
      return <FaMoon className="text-blue-400 animate-bounce" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  const getFinancialInsights = (data) => {
    const insights = [];
    if (data.totalExpenses > data.totalIncome * 0.8) {
      insights.push(t("dashboard.insights.expensesWarning"));
    }
    if (data.totalSavings > 0) {
      insights.push(t("dashboard.insights.savingsProgress"));
    }
    return insights[0] || t("dashboard.insights.goodFinances");
  };

  const calculateHealthScore = (data) => {
    let score = 100;
    if (data.totalExpenses > data.totalIncome) score -= 30;
    if (data.totalSavings < data.totalIncome * 0.1) score -= 20;
    return Math.max(score, 0);
  };

  const handleAddTransaction = async (data) => {
    if (!user?.uid) return;

    try {
      const paymentMethod = data.paymentMethod.toLowerCase();
      const amount = Number(data.amount);

      await runTransaction(db, async (transaction) => {
        const collectionName =
          paymentMethod === "wallet" ? "walletDetails" : "cardDetails";
        const docRef = doc(db, collectionName, user.uid);
        const balanceDoc = await transaction.get(docRef);

        if (!balanceDoc.exists()) {
          throw new Error(`${collectionName} document does not exist!`);
        }

        const currentBalance = Number(balanceDoc.data().balance || 0);
        const newBalance =
          data.type === "Income"
            ? currentBalance + amount
            : currentBalance - amount;

        const transactionDoc = {
          ...data,
          userId: user.uid,
          date: data.date?.toDate?.() || data.date || new Date(),
          paymentMethod: paymentMethod,
          amount: amount,
        };

        transaction.update(docRef, { balance: newBalance });
        const transactionRef = doc(collection(db, "transactions"));
        transaction.set(transactionRef, transactionDoc);
      });

      // Fetch updated data after successful transaction
      await fetchFinancialData();
      setIsTransactionModalOpen(false);

      toast.success(
        t("transactions.transactionadded", {
          amount: amount,
          action:
            data.type === "Income"
              ? t("transactions.type.income")
              : t("transactions.type.expense"),
          method:
            paymentMethod === "wallet"
              ? t("transactions.payment.wallet").toLowerCase()
              : t("transactions.payment.card").toLowerCase(),
        })
      );

      if (newBalance < 100) {
        toast.error(
          t("transactions.lowBalancealert", {
            balance: newBalance,
            method:
              paymentMethod === "wallet"
                ? t("transactions.payment.wallet").toLowerCase()
                : t("transactions.payment.card").toLowerCase(),
          })
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("transactions.error"));
    }
  };

  const parseTransactionDate = (dateValue) => {
    try {
      if (dateValue?.toDate) {
        return dateValue.toDate();
      }
      if (typeof dateValue === "number") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) return date;
      }
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) return date;
      }
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue;
      }

      console.error("Invalid date value:", dateValue);
      return null;
    } catch (error) {
      console.error("Error parsing date:", error, "Value:", dateValue);
      return null;
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
      >
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-800 dark:text-white flex items-center gap-3">
          <span className="inline-block">{getTimeIcon()}</span>
          {greetingTime()}
        </h1>
        <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t("dashboard.subtitle")}
        </h5>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <button
          onClick={() => setIsTransactionModalOpen(true)}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <div className="w-12 h-12 rounded-full bg-finance-blue-50 dark:bg-finance-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaPlus className="text-xl text-finance-blue-600 dark:text-finance-blue-400" />
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {t("dashboard.quickactions.quickadd")}
          </span>
        </button>

        <button
          onClick={() => navigate("/budget-limits")}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaChartBar className="text-xl text-green-600 dark:text-green-400" />
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {budgetLimitsExist
              ? t("dashboard.quickactions.viewBudgets")
              : t("dashboard.quickactions.setBudgets")}
          </span>
        </button>

        <button
          onClick={() => navigate("/reports")}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaChartBar className="text-xl text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {t("dashboard.quickactions.reports")}
          </span>
        </button>

        <button
          onClick={() => navigate("/income")}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaMoneyBillWave className="text-xl text-orange-600 dark:text-orange-400" />
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {t("dashboard.quickactions.sources")}
          </span>
        </button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow h-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-finance-blue-100 dark:bg-finance-blue-900/30 flex items-center justify-center">
              <FaWallet className="text-finance-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.totalbalance")}
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">
                ${financialData.totalBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaCreditCard className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.totalIncome")}
              </p>
              <p className="text-xl font-semibold text-green-500">
                ${financialData.totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FaCreditCard className="text-red-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.totalExpenses")}
              </p>
              <p className="text-xl font-semibold text-red-500">
                ${financialData.totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-finance-blue-100 dark:bg-finance-blue-900/30 flex items-center justify-center">
              <FaPiggyBank className="text-finance-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.totalSavings")}
              </p>
              <p className="text-xl font-semibold text-finance-blue-500">
                ${financialData.totalSavings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow h-auto">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white text-center">
            {t("dashboard.incomevsexpenses")}
          </h3>
          <div
            className="flex items-center justify-center"
            style={{ height: "280px" }}
          >
            <div className="w-full max-w-[280px] aspect-square">
              <IncomeExpenseDoughnutChart userId={user?.uid} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaHistory className="text-finance-blue-500" />
            {t("dashboard.recentTransactions")}
          </h3>
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {financialData.recentTransactions.length > 0 ? (
              financialData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          transaction.type === "Income"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <p className="font-medium text-gray-800 dark:text-white">
                        {transaction.provider}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {(() => {
                          const parsedDate = parseTransactionDate(
                            transaction.date
                          );
                          return parsedDate
                            ? parsedDate.toLocaleDateString(i18n.language, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : t("transactions.invalidDate");
                        })()}
                      </span>
                      <span className="capitalize">
                        {t(
                          `transactions.type.${transaction.type.toLowerCase()}`
                        )}
                      </span>
                      <span className="capitalize">
                        {transaction.type.toLowerCase() === "income"
                          ? t(
                              `transactions.categories.income.${transaction.category}`
                            )
                          : t(
                              `transactions.categories.${transaction.categoryType}.${transaction.category}`
                            )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        transaction.type === "Income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "Income" ? "+" : "-"}$
                      {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                {t("dashboard.noRecentTransactions")}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <FaChartLine className="text-finance-blue-500" />
            {t("dashboard.insights.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {getFinancialInsights(financialData)}
          </p>

          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("dashboard.insights.financialHealth")}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-finance-blue-500">
                {calculateHealthScore(financialData)}%
              </span>
              <Progress
                percent={calculateHealthScore(financialData)}
                showInfo={false}
                strokeColor="#0c8de0"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <FaBullseye className="text-finance-blue-500" />
            {t("savingsGoals.title")}
          </h3>
          <div className="space-y-4">
            {savingsGoals?.filter(
              (goal) => goal.currentAmount < goal.goalAmount
            ).length > 0 ? (
              savingsGoals
                ?.filter((goal) => goal.currentAmount < goal.goalAmount)
                .map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {goal.goalName}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ${goal.currentAmount?.toLocaleString()} / $
                        {goal.goalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(
                        (goal.currentAmount / goal.goalAmount) * 100
                      )}
                      strokeColor="#0c8de0"
                      size="small"
                    />
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                {t("dashboard.noActiveGoals")}
              </p>
            )}
            <button
              onClick={() => navigate("/savings-goals")}
              className="mt-2 w-full py-2 bg-transparent border-2 border-dashed border-finance-blue-300 dark:border-finance-blue-700 hover:border-finance-blue-500 dark:hover:border-finance-blue-500 text-finance-blue-600 dark:text-finance-blue-400 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              {t("savingsGoals.addGoal")}
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
  );
}

export default DashBoard;
