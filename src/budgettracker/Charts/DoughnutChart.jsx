"use client"

import { useEffect, useState } from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../config/firebase"
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
} from "react-icons/fa"

ChartJS.register(ArcElement, Tooltip, Legend)

const DoughnutChart = ({ userId, type }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  })

  const categoryIcons = {
    // Income Categories
    Salary: FaMoneyBill,
    "Freelance Income": FaBriefcase,
    Bonus: FaCoins,
    "Investment Income": FaChartLine,
    "Rental Income": FaHome,
    Dividends: FaHandHoldingUsd,
    "Interest Income": FaPiggyBank,
    Gifts: FaGift,
    Refunds: FaUniversity,
    "Other Income": FaWallet,

    // Expense Categories
    "Rent/Mortgage": FaHome,
    Utilities: FaWifi,
    Groceries: FaShoppingCart,
    Transportation: FaCar,
    Insurance: FaStethoscope,
    "Medical Expenses": FaStethoscope,
    Internet: FaWifi,
    "Phone Bill": FaPhone,
    Childcare: FaChild,
    "Loan Payments": FaUniversity,
    "Dining Out": FaHamburger,
    Entertainment: FaFilm,
    Shopping: FaShoppingCart,
    Travel: FaPlane,
    "Gym/Fitness": FaDumbbell,
    Subscriptions: FaFilm,
    "Gifts/Donations": FaGift,
    "Personal Care": FaHeart,
    "Pet Expenses": FaPaw,
    "Other Expenses": FaWallet,
  }

  const categoryColors = {
    // Income Categories
    Salary: "rgba(255, 99, 132, 0.8)",
    "Freelance Income": "rgba(54, 162, 235, 0.8)",
    Bonus: "rgba(255, 206, 86, 0.8)",
    "Investment Income": "rgba(75, 192, 192, 0.8)",
    "Rental Income": "rgba(153, 102, 255, 0.8)",
    Dividends: "rgba(255, 159, 64, 0.8)",
    "Interest Income": "rgba(201, 203, 207, 0.8)",
    Gifts: "rgba(255, 99, 132, 0.8)",
    Refunds: "rgba(54, 162, 235, 0.8)",
    "Other Income": "rgba(255, 206, 86, 0.8)",

    // Expense Categories
    "Rent/Mortgage": "rgba(75, 192, 192, 0.8)",
    Utilities: "rgba(153, 102, 255, 0.8)",
    Groceries: "rgba(255, 159, 64, 0.8)",
    Transportation: "rgba(201, 203, 207, 0.8)",
    Insurance: "rgba(255, 99, 132, 0.8)",
    "Medical Expenses": "rgba(54, 162, 235, 0.8)",
    Internet: "rgba(255, 206, 86, 0.8)",
    "Phone Bill": "rgba(75, 192, 192, 0.8)",
    Childcare: "rgba(153, 102, 255, 0.8)",
    "Loan Payments": "rgba(255, 159, 64, 0.8)",
    "Dining Out": "rgba(201, 203, 207, 0.8)",
    Entertainment: "rgba(255, 99, 132, 0.8)",
    Shopping: "rgba(54, 162, 235, 0.8)",
    Travel: "rgba(255, 206, 86, 0.8)",
    "Gym/Fitness": "rgba(75, 192, 192, 0.8)",
    Subscriptions: "rgba(153, 102, 255, 0.8)",
    "Gifts/Donations": "rgba(255, 159, 64, 0.8)",
    "Personal Care": "rgba(201, 203, 207, 0.8)",
    "Pet Expenses": "rgba(255, 99, 132, 0.8)",
    "Other Expenses": "rgba(54, 162, 235, 0.8)",
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return

      const q = query(collection(db, "transactions"), where("userId", "==", userId), where("type", "==", type))
      const querySnapshot = await getDocs(q)
      const transactions = querySnapshot.docs.map((doc) => doc.data())

      const categoryData = {}

      transactions.forEach((transaction) => {
        categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount
      })

      const labels = Object.keys(categoryData)
      const values = labels.map((category) => categoryData[category])
      const backgroundColors = labels.map((label) => categoryColors[label])
      const borderColors = backgroundColors.map((color) => color.replace("0.8", "1"))

      setData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      })
    }

    fetchData()
  }, [userId, type])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(2)
            return `${label}: $${value.toFixed(2)} (${percentage}%)`
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
    },
    cutout: "70%",
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  }

  const renderLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4 max-h-24 overflow-y-auto px-2">
        {data.labels.map((label, index) => {
          const Icon = categoryIcons[label] || FaWallet
          return (
            <div
              key={index}
              className="flex items-center gap-1 text-xs md:text-sm bg-white dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: data.datasets[0].backgroundColor[index],
                }}
              >
                <Icon className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="dark:text-white">{label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-3/4 flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
      {renderLegend()}
    </div>
  )
}

export default DoughnutChart

