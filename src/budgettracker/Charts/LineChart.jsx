import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../config/firebase"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const LineChart = ({ userId }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Savings",
        data: [],
        borderColor: "#8B5CF6", // Purple color for savings
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
        tension: 0.4, // Makes the line curved
      },
      {
        label: "Target Goals",
        data: [],
        borderColor: "#10B981", // Green color for targets
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return

        // Fetch savings goals
        const savingsDoc = await getDoc(doc(db, "savingsGoals", userId))
        const savingsGoals = savingsDoc.exists() ? savingsDoc.data().goals : []

        // Process savings data by month
        const monthlyData = {}
        const monthlyTargets = {}

        savingsGoals.forEach((goal) => {
          const currentAmount = goal.currentAmount || 0
          const targetAmount = goal.goalAmount || 0

          // Get the creation date or current date if not available
          const date = goal.createdAt ? new Date(goal.createdAt) : new Date()
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

          // Accumulate savings and targets
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + currentAmount
          monthlyTargets[monthKey] = (monthlyTargets[monthKey] || 0) + targetAmount
        })

        // Get all months
        const allMonths = Object.keys(monthlyData).sort()

        // Calculate cumulative totals
        let cumulativeSavings = 0
        let cumulativeTargets = 0

        const savingsProgress = allMonths.map((month) => {
          cumulativeSavings += monthlyData[month] || 0
          return cumulativeSavings
        })

        const targetProgress = allMonths.map((month) => {
          cumulativeTargets += monthlyTargets[month] || 0
          return cumulativeTargets
        })

        setData({
          labels: allMonths.map((date) => {
            const [year, month] = date.split("-")
            return `${new Date(year, month - 1).toLocaleString("default", {
              month: "short",
            })} ${year}`
          }),
          datasets: [
            {
              label: "Your Savings",
              data: savingsProgress,
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Target Goals",
              data: targetProgress,
              borderColor: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching savings data:", error)
      }
    }

    fetchData()
  }, [userId])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
          color: document.documentElement.classList.contains("dark") ? "white" : undefined,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y)
            }
            return label
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount ($)",
          font: {
            size: 14,
            weight: "bold",
          },
          color: document.documentElement.classList.contains("dark") ? "white" : undefined,
        },
        ticks: {
          callback: (value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
          color: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.7)" : undefined,
        },
        grid: {
          color: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.1)" : undefined,
        },
      },
      x: {
        grid: {
          display: false,
          color: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.1)" : undefined,
        },
        title: {
          display: true,
          text: "Month",
          font: {
            size: 14,
            weight: "bold",
          },
          color: document.documentElement.classList.contains("dark") ? "white" : undefined,
        },
        ticks: {
          color: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.7)" : undefined,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  }

  return (
    <div className="w-full h-full min-h-[300px] p-4">
      <Line data={data} options={options} />
    </div>
  )
}

export default LineChart

