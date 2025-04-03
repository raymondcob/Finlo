import { useState, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Tabs } from "antd";
import { UserContext } from "../context/UserContext";
import CustomCalendar from "./Charts/Calendar";
import DoughnutChart from "./Charts/DoughnutChart";
import LineChart from "./Charts/LineChart";

const Reports = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("1");

  // Memoize animation variants to prevent recreating on each render
  const animations = useMemo(
    () => ({
      containerVariants: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      },
      itemVariants: {
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
      },
    }),
    []
  );

  // Memoize tab items to prevent recreation on each render
  const tabItems = useMemo(
    () => [
      {
        label: t("reports.tabs.overview"),
        key: "1",
        children: (
          <motion.div variants={animations.itemVariants} className="space-y-6">
            {/* Overview content */}
            <div className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-finance-blue-700 dark:text-finance-blue-300 mb-2 sm:mb-4">
                {t("reports.charts.yearlyComparison")}
              </h2>
              <div className="h-60 sm:h-80">
                <LineChart userId={user?.uid} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-finance-green-700 dark:text-finance-green-300 mb-2 sm:mb-4">
                  {t("reports.charts.incomeCategories")}
                </h2>
                <div className="h-48 sm:h-64">
                  <DoughnutChart userId={user?.uid} type="Income" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 mb-2 sm:mb-4">
                  {t("reports.charts.expenseCategories")}
                </h2>
                <div className="h-48 sm:h-64">
                  <DoughnutChart userId={user?.uid} type="Expense" />
                </div>
              </div>
            </div>
          </motion.div>
        ),
      },
      {
        label: t("reports.tabs.calendar"),
        key: "2",
        children: (
          <motion.div
            variants={animations.itemVariants}
            className="bg-white dark:bg-gray-700 p-2 sm:p-4 md:p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-finance-blue-700 dark:text-finance-blue-300 mb-2 sm:mb-4">
              {t("reports.charts.monthlyCalendar")}
            </h2>
            <div className="h-[calc(100vh-300px)]">
              <CustomCalendar userId={user?.uid} />
            </div>
          </motion.div>
        ),
      },
    ],
    [t, animations.itemVariants, user?.uid]
  );

  return (
    <motion.div
      variants={animations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 bg-gray-50 dark:bg-gray-900"
    >
      <motion.div
        variants={animations.itemVariants}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          {t("reports.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t("reports.subtitle")}
        </p>
      </motion.div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      />
    </motion.div>
  );
};

export default Reports;
