import { useState, useContext, useEffect } from "react"
import { UserContext } from "../context/UserContext"
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import AddTransactionModal from "./modals/AddTransactionModal"
import { Card, List, Typography, Table, Tag } from "antd"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { enUS, es, fr } from "date-fns/locale"
import {
  FaMoneyBill,
  FaBriefcase,
  FaCoins,
  FaChartLine,
  FaHome,
  FaHandHoldingUsd,
  FaPiggyBank,
  FaGift,
  FaUniversity,
  FaWallet,
  FaWifi,
  FaShoppingCart,
  FaCar,
  FaStethoscope,
  FaPhone,
  FaChild,
  FaHamburger,
  FaFilm,
  FaPlane,
  FaDumbbell,
  FaHeart,
  FaPaw,
} from "react-icons/fa" // Add missing imports
import toast from "react-hot-toast"

const { Title, Text } = Typography

// Define or import these variables
const incomeCategories = [
  { label: "Salary" },
  { label: "Freelance Income" },
  { label: "Bonus" },
  { label: "Investment Income" },
  { label: "Rental Income" },
  { label: "Dividends" },
  { label: "Interest Income" },
  { label: "Gifts" },
  { label: "Refunds" },
  { label: "Other Income" },
]

const essentialExpenses = [
  { label: "Rent/Mortgage" },
  { label: "Utilities" },
  { label: "Groceries" },
  { label: "Transportation" },
  { label: "Insurance" },
  { label: "Medical Expenses" },
  { label: "Internet" },
  { label: "Phone Bill" },
  { label: "Childcare" },
  { label: "Loan Payments" },
]

const lifestyleExpenses = [
  { label: "Dining Out" },
  { label: "Entertainment" },
  { label: "Shopping" },
  { label: "Travel" },
  { label: "Gym/Fitness" },
  { label: "Subscriptions" },
  { label: "Gifts/Donations" },
  { label: "Personal Care" },
  { label: "Pet Expenses" },
  { label: "Other Expenses" },
]

const Transactions = () => {
  const { t, i18n } = useTranslation()
  const { user } = useContext(UserContext)
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardDetails, setCardDetails] = useState({ balance: 0 })
  const [walletDetails, setWalletDetails] = useState({ balance: 0 })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (user) {
      const fetchDetails = async () => {
        const cardDoc = await getDoc(doc(db, "cardDetails", user.uid))
        const walletDoc = await getDoc(doc(db, "walletDetails", user.uid))
        if (cardDoc.exists()) {
          setCardDetails(cardDoc.data())
        }
        if (walletDoc.exists()) {
          setWalletDetails(walletDoc.data())
        }
      }
      fetchDetails()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const transactionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTransactions(transactionsData)
      }
      fetchTransactions()
    }
  }, [user])

  const handleAddTransaction = async (transaction) => {
    if (user) {
      const dateValue = new Date(transaction.date)
      const localDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 12, 0, 0, 0)

      const newTransaction = {
        ...transaction,
        userId: user.uid,
        date: localDate,
        amount: Number.parseFloat(transaction.amount),
        category: transaction.category,
      }

      // Check for balance before adding expense
      if (transaction.type === "Expense") {
        const currentBalance =
          transaction.paymentMethod === "Card"
            ? Number.parseFloat(cardDetails.balance)
            : Number.parseFloat(walletDetails.balance)

        if (newTransaction.amount > currentBalance) {
          toast.error(t("transactions.insufficientBalance"))
          return // Prevent adding the transaction
        }
      }

      // Update balance and add notifications based on transaction type
      if (transaction.type === "Income") {
        if (transaction.paymentMethod === "Card") {
          const newBalance = (Number.parseFloat(cardDetails.balance) + newTransaction.amount).toFixed(2)
          setCardDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "cardDetails", user.uid), {
            balance: newBalance,
          })
          toast.success(
            t("transactions.transactionadded", {
              amount: newTransaction.amount,
              action: t("transactions.type.income"),
              method: t("transactions.payment.card").toLowerCase(),
            }),
          )
        } else if (transaction.paymentMethod === "Wallet") {
          const newBalance = (Number.parseFloat(walletDetails.balance) + newTransaction.amount).toFixed(2)
          setWalletDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "walletDetails", user.uid), {
            balance: newBalance,
          })
          toast.success(
            t("transactions.transactionadded", {
              amount: newTransaction.amount,
              action: t("transactions.type.income"),
              method: t("transactions.payment.wallet").toLowerCase(),
            }),
          )
        }
      } else if (transaction.type === "Expense") {
        if (transaction.paymentMethod === "Card") {
          const newBalance = (Number.parseFloat(cardDetails.balance) - newTransaction.amount).toFixed(2)
          setCardDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "cardDetails", user.uid), {
            balance: newBalance,
          })
          if (Number(newBalance) < 100) {
            toast.error(
              t("transactions.lowBalancealert", {
                balance: newBalance,
                method: t("transactions.payment.card").toLowerCase(),
              }),
            )
          }
          toast.success(
            t("transactions.transactionadded", {
              amount: newTransaction.amount,
              action: t("transactions.type.expense"),
              method: t("transactions.payment.card").toLowerCase(),
            }),
          )
        } else if (transaction.paymentMethod === "Wallet") {
          const newBalance = (Number.parseFloat(walletDetails.balance) - newTransaction.amount).toFixed(2)
          setWalletDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "walletDetails", user.uid), {
            balance: newBalance,
          })
          if (Number(newBalance) < 100) {
            toast.error(
              t("transactions.lowBalancealert", {
                balance: newBalance,
                method: t("transactions.payment.wallet").toLowerCase(),
              }),
            )
          }
          toast.success(
            t("transactions.transactionadded", {
              amount: newTransaction.amount,
              action: t("transactions.type.expense"),
              method: t("transactions.payment.wallet").toLowerCase(),
            }),
          )
        }
      }

      const docRef = await addDoc(collection(db, "transactions"), newTransaction)
      setTransactions([...transactions, { id: docRef.id, ...newTransaction }])
    }
  }

  const renderCategoryTag = (category) => {
    const getCategoryType = (cat) => {
      if (incomeCategories.some((item) => item.label === cat)) return "income"
      if (essentialExpenses.some((item) => item.label === cat)) return "essential"
      if (lifestyleExpenses.some((item) => item.label === cat)) return "lifestyle"
      return ""
    }

    const categoryType = getCategoryType(category)
    const translationKey = `transactions.categories.${categoryType}.${category.toLowerCase().replace(/\s+/g, "")}`

    const categoryIcons = {
      Salary: <FaMoneyBill className="text-white" />,
      "Freelance Income": <FaBriefcase className="text-white" />,
      Bonus: <FaCoins className="text-white" />,
      "Investment Income": <FaChartLine className="text-white" />,
      "Rental Income": <FaHome className="text-white" />,
      Dividends: <FaHandHoldingUsd className="text-white" />,
      "Interest Income": <FaPiggyBank className="text-white" />,
      Gifts: <FaGift className="text-white" />,
      Refunds: <FaUniversity className="text-white" />,
      "Other Income": <FaWallet className="text-white" />,
      "Rent/Mortgage": <FaHome className="text-white" />,
      Utilities: <FaWifi className="text-white" />,
      Groceries: <FaShoppingCart className="text-white" />,
      Transportation: <FaCar className="text-white" />,
      Insurance: <FaStethoscope className="text-white" />,
      "Medical Expenses": <FaStethoscope className="text-white" />,
      Internet: <FaWifi className="text-white" />,
      "Phone Bill": <FaPhone className="text-white" />,
      Childcare: <FaChild className="text-white" />,
      "Loan Payments": <FaUniversity className="text-white" />,
      "Dining Out": <FaHamburger className="text-white" />,
      Entertainment: <FaFilm className="text-white" />,
      Shopping: <FaShoppingCart className="text-white" />,
      Travel: <FaPlane className="text-white" />,
      "Gym/Fitness": <FaDumbbell className="text-white" />,
      Subscriptions: <FaFilm className="text-white" />,
      "Gifts/Donations": <FaGift className="text-white" />,
      "Personal Care": <FaHeart className="text-white" />,
      "Pet Expenses": <FaPaw className="text-white" />,
      "Other Expenses": <FaWallet className="text-white" />,
    }

    const icon = categoryIcons[category] || null

    return (
      <Tag color="#0c8de0" className="flex items-center gap-2 w-max rounded-full px-2 py-1">
        {icon}
        <span className="text-sm font-inter font-normal text-white">{t(translationKey)}</span>
      </Tag>
    )
  }

  const getLocale = (language) => {
    const locales = {
      en: enUS,
      es: es,
      fr: fr,
      // Add other mappings as needed
    }
    return locales[language] || enUS
  }

  const columns = [
    {
      title: t("transactions.category"),
      dataIndex: "category",
      key: "category",
      filters: [
        {
          text: t("transactions.categories.income.title"),
          value: "Income",
          children: incomeCategories.map((cat) => ({
            text: t(`transactions.categories.income.${cat.label.toLowerCase().replace(/\s+/g, "")}`),
            value: cat.label,
          })),
        },
        {
          text: t("transactions.categories.essential.title"),
          value: "Essential Expenses",
          children: essentialExpenses.map((cat) => ({
            text: t(`transactions.categories.essential.${cat.label.toLowerCase().replace(/\s+/g, "")}`),
            value: cat.label,
          })),
        },
        {
          text: t("transactions.categories.lifestyle.title"),
          value: "Lifestyle Expenses",
          children: lifestyleExpenses.map((cat) => ({
            text: t(`transactions.categories.lifestyle.${cat.label.toLowerCase().replace(/\s+/g, "")}`),
            value: cat.label,
          })),
        },
      ],
      onFilter: (value, record) => {
        if (value === "Income") {
          return incomeCategories.some((cat) => cat.label === record.category)
        } else if (value === "Essential Expenses") {
          return essentialExpenses.some((cat) => cat.label === record.category)
        } else if (value === "Lifestyle Expenses") {
          return lifestyleExpenses.some((cat) => cat.label === record.category)
        }
        return record.category.includes(value)
      },
      render: (category) => renderCategoryTag(category),
    },
    {
      title: t("transactions.tabletype"),
      dataIndex: "type",
      key: "type",
      filters: [
        { text: t("transactions.type.expense"), value: "Expense" },
        { text: t("transactions.type.income"), value: "Income" },
      ],
      onFilter: (value, record) => record.type.includes(value),
      render: (type) => (
        <Tag color={type === "Income" ? "#20b77c" : "#f96a16"} className="rounded-full px-3 py-1">
          {t(`transactions.type.${type.toLowerCase()}`)}
        </Tag>
      ),
    },
    {
      title: t("transactions.provider"),
      dataIndex: "provider",
      key: "provider",
      sorter: (a, b) => a.provider.localeCompare(b.provider),
    },
    {
      title: t("transactions.paymentMethod"),
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      filters: [
        { text: t("transactions.payment.wallet"), value: "Wallet" },
        { text: t("transactions.payment.card"), value: "Card" },
      ],
      onFilter: (value, record) => record.paymentMethod.includes(value),
      render: (method) => (
        <Tag color={method === "Card" ? "#0c8de0" : "#20b77c"} className="rounded-full px-3 py-1">
          {t(`transactions.payment.${method.toLowerCase()}`)}
        </Tag>
      ),
    },
    {
      title: t("transactions.date"),
      dataIndex: "date",
      key: "date",
      defaultSortOrder: "descend",
      render: (date) => {
        const timestamp = date?.toDate ? date.toDate() : new Date(date)
        const locale = getLocale(i18n.language)

        return format(timestamp, "PPP", { locale })
      },
      sorter: (a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
        return dateB - dateA
      },
      filters: [
        {
          text: t("transactions.dateFilters.last7days"),
          value: "7days",
        },
        {
          text: t("transactions.dateFilters.last30days"),
          value: "30days",
        },
        {
          text: t("transactions.dateFilters.last90days"),
          value: "90days",
        },
      ],
      onFilter: (value, record) => {
        const transactionDate = record.date?.toDate ? record.date.toDate() : new Date(record.date)
        const now = new Date()
        const diffTime = Math.abs(now - transactionDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (value) {
          case "7days":
            return diffDays <= 7
          case "30days":
            return diffDays <= 30
          case "90days":
            return diffDays <= 90
          default:
            return true
        }
      },
    },
    {
      title: t("transactions.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <span className={record.type === "Income" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {record.type === "Income" ? "+" : "-"}${amount.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
  ]

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

  const renderMobileList = () => (
    <List
      dataSource={transactions.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
        return dateB - dateA
      })}
      renderItem={(item) => (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-4">
          <Card className="w-full shadow-md dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {renderCategoryTag(item.category)}
                <Tag color={item.type === "Income" ? "#20b77c" : "#f96a16"} className="ml-2 rounded-full px-3 py-1">
                  {t(`transactions.type.${item.type.toLowerCase()}`)}
                </Tag>
              </div>
              <Text strong className="dark:text-gray-200">
                {format(item.date?.toDate ? item.date.toDate() : new Date(item.date), "PPP", {
                  locale: getLocale(i18n.language),
                })}
              </Text>
            </div>
            <div className="flex justify-between items-center mb-2">
              <Text className="text-gray-600 dark:text-gray-300">{item.provider}</Text>
              <Tag color={item.paymentMethod === "Card" ? "#0c8de0" : "#20b77c"} className="rounded-full px-3 py-1">
                {t(`transactions.payment.${item.paymentMethod.toLowerCase()}`)}
              </Tag>
            </div>
            <div className="flex justify-end items-center">
              <Text
                className={`text-lg font-semibold ${item.type === "Income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {item.type === "Income" ? "+" : "-"}${item.amount.toFixed(2)}
              </Text>
            </div>
          </Card>
        </motion.div>
      )}
    />
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">{t("transactions.title")}</h1>
            <p className="text-gray-600 dark:text-gray-300">{t("transactions.subtitle")}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-transparent border-2 border-dashed border-finance-blue-300 dark:border-finance-blue-700 hover:border-finance-blue-500 dark:hover:border-finance-blue-500 text-finance-blue-600 dark:text-finance-blue-400 rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("transactions.addtransaction")}
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isMobile ? (
          <motion.div variants={itemVariants} className="space-y-4">
            {renderMobileList()}
          </motion.div>
        ) : (
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            scroll={{ x: true }}
          />
        )}
      </motion.div>

      {isModalOpen && (
        <AddTransactionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          cardBalance={cardDetails.balance}
          walletBalance={walletDetails.balance}
        />
      )}
    </motion.div>
  )
}

export default Transactions;

