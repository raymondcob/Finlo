import { useState, useContext, useEffect } from "react"
import { UserContext } from "../context/UserContext"
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import AddTransactionModal from "./modals/AddTransactionModal"
import AddTransactionButton from "./AddTransactionButton"
import { Card, List, Typography, Table, Tag } from "antd"
import { motion } from "framer-motion"
const { Title, Text } = Typography
import {
  FaShoppingCart,
  FaMoneyBill,
  FaBriefcase,
  FaCoins,
  FaChartLine,
  FaHome,
  FaHandHoldingUsd,
  FaPiggyBank,
  FaGift,
  FaUniversity,
  FaWifi,
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
  FaWallet,
} from "react-icons/fa"

const Transactions = () => {
  const { user } = useContext(UserContext)
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardDetails, setCardDetails] = useState({ balance: 0 })
  const [walletDetails, setWalletDetails] = useState({ balance: 0 })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Income Categories
  const incomeCategories = [
    { label: "Salary", icon: <FaMoneyBill />, color: "#0c8de0" },
    { label: "Freelance Income", icon: <FaBriefcase />, color: "#0c8de0" },
    { label: "Bonus", icon: <FaCoins />, color: "#0c8de0" },
    { label: "Investment Income", icon: <FaChartLine />, color: "#0c8de0" },
    { label: "Rental Income", icon: <FaHome />, color: "#0c8de0" },
    { label: "Dividends", icon: <FaHandHoldingUsd />, color: "#0c8de0" },
    { label: "Interest Income", icon: <FaPiggyBank />, color: "#0c8de0" },
    { label: "Gifts", icon: <FaGift />, color: "#0c8de0" },
    { label: "Refunds", icon: <FaUniversity />, color: "#0c8de0" },
    { label: "Other Income", icon: <FaWallet />, color: "#0c8de0" },
  ]

  // Essential Expenses
  const essentialExpenses = [
    { label: "Rent/Mortgage", icon: <FaHome />, color: "#0c8de0" },
    { label: "Utilities", icon: <FaWifi />, color: "#0c8de0" },
    { label: "Groceries", icon: <FaShoppingCart />, color: "#0c8de0" },
    { label: "Transportation", icon: <FaCar />, color: "#0c8de0" },
    { label: "Insurance", icon: <FaStethoscope />, color: "#0c8de0" },
    { label: "Medical Expenses", icon: <FaStethoscope />, color: "#0c8de0" },
    { label: "Internet", icon: <FaWifi />, color: "#0c8de0" },
    { label: "Phone Bill", icon: <FaPhone />, color: "#0c8de0" },
    { label: "Childcare", icon: <FaChild />, color: "#0c8de0" },
    { label: "Loan Payments", icon: <FaUniversity />, color: "#0c8de0" },
  ]

  // Lifestyle Expenses
  const lifestyleExpenses = [
    { label: "Dining Out", icon: <FaHamburger />, color: "#0c8de0" },
    { label: "Entertainment", icon: <FaFilm />, color: "#0c8de0" },
    { label: "Shopping", icon: <FaShoppingCart />, color: "#0c8de0" },
    { label: "Travel", icon: <FaPlane />, color: "#0c8de0" },
    { label: "Gym/Fitness", icon: <FaDumbbell />, color: "#0c8de0" },
    { label: "Subscriptions", icon: <FaFilm />, color: "#0c8de0" },
    { label: "Gifts/Donations", icon: <FaGift />, color: "#0c8de0" },
    { label: "Personal Care", icon: <FaHeart />, color: "#0c8de0" },
    { label: "Pet Expenses", icon: <FaPaw />, color: "#0c8de0" },
    { label: "Other Expenses", icon: <FaWallet />, color: "#0c8de0" },
  ]

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
        const transactionsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setTransactions(transactionsData)
      }
      fetchTransactions()
    }
  }, [user])

  const handleAddTransaction = async (transaction) => {
    if (user) {
      const newTransaction = {
        ...transaction,
        userId: user.uid,
        date: new Date(transaction.date).toISOString(),
        amount: Number.parseFloat(transaction.amount),
      }

      // Update balance based on transaction type
      if (transaction.type === "Income") {
        if (transaction.paymentMethod === "Card") {
          const newBalance = (Number.parseFloat(cardDetails.balance) + newTransaction.amount).toFixed(2)
          setCardDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "cardDetails", user.uid), { balance: newBalance })
        } else if (transaction.paymentMethod === "Wallet") {
          const newBalance = (Number.parseFloat(walletDetails.balance) + newTransaction.amount).toFixed(2)
          setWalletDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "walletDetails", user.uid), { balance: newBalance })
        }
      } else if (transaction.type === "Expense") {
        if (transaction.paymentMethod === "Card") {
          const newBalance = (Number.parseFloat(cardDetails.balance) - newTransaction.amount).toFixed(2)
          setCardDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "cardDetails", user.uid), { balance: newBalance })
        } else if (transaction.paymentMethod === "Wallet") {
          const newBalance = (Number.parseFloat(walletDetails.balance) - newTransaction.amount).toFixed(2)
          setWalletDetails((prevDetails) => ({
            ...prevDetails,
            balance: newBalance,
          }))
          await updateDoc(doc(db, "walletDetails", user.uid), { balance: newBalance })
        }
      }

      const docRef = await addDoc(collection(db, "transactions"), newTransaction)
      setTransactions([...transactions, { id: docRef.id, ...newTransaction }])
    }
  }

  const renderCategoryTag = (category) => {
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
        <span className="text-sm font-inter font-normal text-white">{category}</span>
      </Tag>
    )
  }

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        {
          text: "Income",
          value: "Income",
          children: incomeCategories.map((cat) => ({ text: cat.label, value: cat.label })),
        },
        {
          text: "Essential Expenses",
          value: "Essential Expenses",
          children: essentialExpenses.map((cat) => ({ text: cat.label, value: cat.label })),
        },
        {
          text: "Lifestyle Expenses",
          value: "Lifestyle Expenses",
          children: lifestyleExpenses.map((cat) => ({ text: cat.label, value: cat.label })),
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
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Expense", value: "Expense" },
        { text: "Income", value: "Income" },
      ],
      onFilter: (value, record) => record.type.includes(value),
      render: (type) => (
        <Tag color={type === "Income" ? "#20b77c" : "#f96a16"} className="rounded-full px-3 py-1">
          {type}
        </Tag>
      ),
    },
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      sorter: (a, b) => a.provider.localeCompare(b.provider),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      filters: [
        { text: "Wallet", value: "Wallet" },
        { text: "Card", value: "Card" },
      ],
      onFilter: (value, record) => record.paymentMethod.includes(value),
      render: (method) => (
        <Tag color={method === "Card" ? "#0c8de0" : "#20b77c"} className="rounded-full px-3 py-1">
          {method}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Amount",
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

  const renderMobileList = () => (
    <List
      dataSource={transactions}
      renderItem={(item) => (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-4">
          <Card className="w-full shadow-md">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {renderCategoryTag(item.category)}
                <Tag color={item.type === "Income" ? "#20b77c" : "#f96a16"} className="ml-2 rounded-full px-3 py-1">
                  {item.type}
                </Tag>
              </div>
              <Text strong>{new Date(item.date).toLocaleDateString()}</Text>
            </div>
            <div className="flex justify-between items-center mb-2">
              <Text className="text-gray-600 dark:text-gray-300">{item.provider}</Text>
              <Tag color={item.paymentMethod === "Card" ? "#0c8de0" : "#20b77c"} className="rounded-full px-3 py-1">
                {item.paymentMethod}
              </Tag>
            </div>
            <div className="flex justify-end items-center">
              <Text className={`text-lg font-semibold ${item.type === "Income" ? "text-green-600" : "text-red-600"}`}>
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
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Transactions</h1>
        <p className="text-gray-600 dark:text-gray-300">View and manage your financial transactions</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isMobile ? (
          <motion.div variants={itemVariants} className="space-y-4">
            <Title level={4} className="mb-4 text-gray-700 dark:text-gray-300">
              Recent Transactions
            </Title>
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

      <motion.div variants={itemVariants} className="flex justify-end">
        <AddTransactionButton onClick={() => setIsModalOpen(true)} />
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

export default Transactions

