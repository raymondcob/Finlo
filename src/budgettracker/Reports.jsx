
import { useContext } from "react"
import { UserContext } from "../context/UserContext"
import LineChart from "./Charts/LineChart"
import DoughnutChart from "./Charts/DoughnutChart"
import CustomCalendar from "./Charts/Calendar"
import IncomeExpenseDoughnutChart from "./Charts/IncomeExpenseDoughnutChart"

const Reports = () => {
  const { user } = useContext(UserContext)

  return (
    <div className="space-y-6"> 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Yearly Income vs Expenses and Calendar */}
        <div className="space-y-6">
          {/* Yearly Income vs Expenses */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-blaze-orange-400">Yearly Income vs Expenses</h2>
            <div className="w-full overflow-x-auto">
              <LineChart userId={user.uid} />
            </div>
          </div>

          {/* Calendar - Monthly Transactions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-blaze-orange-400">Monthly Transactions</h2>
            <CustomCalendar userId={user.uid} />
          </div>
        </div>

        {/* Right Side: Income vs Expenses and Expenses by Category */}
        <div className="space-y-6">
          {/* Income vs Expenses Doughnut */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-blaze-orange-400">Income vs Expenses</h2>
            <div className="w-full overflow-x-auto">
              <IncomeExpenseDoughnutChart userId={user.uid} />
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-blaze-orange-400">Expenses by Category</h2>
            <div className="w-full overflow-x-auto">
              <DoughnutChart userId={user.uid} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports