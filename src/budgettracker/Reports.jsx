import { useContext } from "react"
import { UserContext } from "../context/UserContext"
import LineChart from "./Charts/LineChart"
import DoughnutChart from "./Charts/DoughnutChart"
import CustomCalendar from "./Charts/Calendar"
import { motion } from "framer-motion"
import { Tabs } from "antd"

const { TabPane } = Tabs

const Reports = () => {
  const { user } = useContext(UserContext)

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Financial Reports</h1>
        <p className="text-gray-600 dark:text-gray-300">Analyze your financial data with interactive charts</p>
      </motion.div>

      <Tabs
        defaultActiveKey="1"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 sm:p-4 md:p-6"
        tabBarGutter={16}
      >
        <TabPane tab="Overview" key="1">
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-finance-blue-700 dark:text-finance-blue-300 mb-2 sm:mb-4">
                Yearly Income vs Expenses
              </h2>
              <div className="h-60 sm:h-80">
                <LineChart userId={user.uid} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-finance-green-700 dark:text-finance-green-300 mb-2 sm:mb-4">
                  Income Categories
                </h2>
                <div className="h-48 sm:h-64">
                  <DoughnutChart userId={user.uid} type="Income" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 mb-2 sm:mb-4">
                  Expense Categories
                </h2>
                <div className="h-48 sm:h-64">
                  <DoughnutChart userId={user.uid} type="Expense" />
                </div>
              </div>
            </div>
          </motion.div>
        </TabPane>
        <TabPane tab="Transaction Calendar" key="2">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-finance-blue-700 dark:text-finance-blue-300 mb-2 sm:mb-4">
              Monthly Transactions Calendar
            </h2>
            <div className="h-[calc(100vh-300px)]">
              <CustomCalendar userId={user.uid} />
            </div>
          </motion.div>
        </TabPane>
      </Tabs>
    </motion.div>
  )
}

export default Reports

