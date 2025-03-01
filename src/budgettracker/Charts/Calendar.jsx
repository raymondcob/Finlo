import { useEffect, useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../config/firebase"
import { Modal } from "antd"
import {
  ShoppingCartOutlined,
  CoffeeOutlined,
  CarOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  GiftOutlined,
  WalletOutlined,
  BankOutlined,
  DollarOutlined,
} from "@ant-design/icons"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

const categoryIcons = {
  Shopping: <ShoppingCartOutlined />,
  Food: <CoffeeOutlined />,
  Transport: <CarOutlined />,
  Housing: <HomeOutlined />,
  Healthcare: <MedicineBoxOutlined />,
  Entertainment: <GiftOutlined />,
  Salary: <WalletOutlined />,
  Investment: <BankOutlined />,
  Other: <DollarOutlined />,
}

const CustomCalendar = ({ userId }) => {
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(collection(db, "transactions"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      // Group transactions by date and calculate totals
      const transactionsByDate = {}
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const date = moment(data.date).format("YYYY-MM-DD")

        if (!transactionsByDate[date]) {
          transactionsByDate[date] = {
            income: 0,
            expense: 0,
            transactions: [],
          }
        }

        if (data.type === "Income") {
          transactionsByDate[date].income += data.amount
        } else {
          transactionsByDate[date].expense += data.amount
        }
        transactionsByDate[date].transactions.push(data)
      })

      // Convert to events format
      const transactionsData = Object.entries(transactionsByDate).map(([date, data]) => {
        const total = data.income + data.expense
        const incomePercentage = total > 0 ? (data.income / total) * 100 : 0

        return {
          title: (
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${incomePercentage}%`,
                  borderRight: data.expense > 0 ? "2px solid white" : "none",
                }}
              />
              <div className="h-full bg-red-500 mt-[-8px]" style={{ width: `${100 - incomePercentage}%` }} />
            </div>
          ),
          start: new Date(date),
          end: new Date(date),
          allDay: true,
          resource: {
            income: data.income,
            expense: data.expense,
            transactions: data.transactions,
          },
        }
      })

      setEvents(transactionsData)
    }

    fetchTransactions()
  }, [userId])

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: "transparent",
        border: "none",
        padding: "2px",
        margin: "0",
      },
    }
  }

  // Update Modal content to show totals and progress bar
  const renderModalContent = (transactions) => {
    const totalIncome = transactions.reduce((sum, t) => (t.type === "Income" ? sum + t.amount : sum), 0)
    const totalExpense = transactions.reduce((sum, t) => (t.type === "Expense" ? sum + t.amount : sum), 0)
    const total = totalIncome + totalExpense
    const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between mb-2">
            <span className="text-green-600 font-medium text-sm sm:text-base">Income: ${totalIncome.toFixed(2)}</span>
            <span className="text-red-600 font-medium text-sm sm:text-base">Expense: ${totalExpense.toFixed(2)}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{
                width: `${incomePercentage}%`,
                borderRight: totalExpense > 0 ? "2px solid white" : "none",
              }}
            />
            <div className="h-full bg-red-500 mt-[-8px]" style={{ width: `${100 - incomePercentage}%` }} />
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg text-xs sm:text-sm mb-2"
              style={{
                backgroundColor: transaction.type === "Income" ? "rgba(75, 192, 192, 0.1)" : "rgba(255, 99, 132, 0.1)",
                border: `1px solid ${
                  transaction.type === "Income" ? "rgba(75, 192, 192, 0.3)" : "rgba(255, 99, 132, 0.3)"
                }`,
              }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{categoryIcons[transaction.category] || categoryIcons.Other}</span>
                <span className="font-medium">{transaction.category}</span>
              </div>
              <span className={`font-bold ${transaction.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "Income" ? "+" : "-"}${transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleSelectSlot = (slotInfo) => {
    const date = moment(slotInfo.start).format("YYYY-MM-DD")
    const transactions =
      events.find((event) => moment(event.start).format("YYYY-MM-DD") === date)?.resource.transactions || []

    if (transactions.length > 0) {
      setSelectedDate(date)
      setSelectedTransactions(transactions)
      setIsModalVisible(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedDate(null)
    setSelectedTransactions([])
  }

  return (
    <div className="h-[calc(100vh-300px)] w-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        eventPropGetter={eventStyleGetter}
        views={["month"]}
        onSelectSlot={handleSelectSlot}
        selectable={true}
        toolbar={true}
        className="text-xs sm:text-sm md:text-base"
      />

      <Modal
        title={`Transactions for ${selectedDate}`}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        className="dark:bg-gray-800 dark:text-white"
        width="90%"
        style={{ maxWidth: "600px" }}
      >
        {renderModalContent(selectedTransactions)}
      </Modal>
    </div>
  )
}

export default CustomCalendar

