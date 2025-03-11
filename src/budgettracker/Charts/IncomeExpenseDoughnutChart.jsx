import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { FaChartPie } from "react-icons/fa";
import { useTranslation } from "react-i18next";

Chart.register(ArcElement, Tooltip, Legend);

const IncomeExpenseDoughnutChart = ({ userId }) => {
  const { t } = useTranslation();
  const [data, setData] = useState({
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => doc.data());

      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach((transaction) => {
        if (transaction.type === "Income") {
          totalIncome += transaction.amount;
        } else if (transaction.type === "Expense") {
          totalExpenses += transaction.amount;
        }
      });

      setData({
        labels: [t("transactions.type.income"), t("transactions.type.expense")],
        datasets: [
          {
            data: [totalIncome, totalExpenses],
            backgroundColor: ["#4caf50", "#f44336"],
          },
        ],
      });
    };

    fetchData();
  }, [userId]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const generateLegend = () => {
    return data.labels.map((label, index) => (
      <div key={index} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
        ></div>
        <span className="text-sm">{label}</span>
      </div>
    ));
  };

  const hasData = data.datasets[0].data.some((value) => value > 0);

  const renderNoData = () => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FaChartPie className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm md:text-base">No transactions found</p>
        <p className="text-xs md:text-sm mt-1">
          Add transactions to see your financial overview
        </p>
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%", // Take full width of parent
        height: "100%", // Take full height of parent
      }}
    >
      {hasData ? (
        <>
          <div className="flex justify-center mb-2 space-x-4">
            {generateLegend()}
          </div>
          <Doughnut data={data} options={options} />
        </>
      ) : (
        renderNoData()
      )}
    </div>
  );
};

export default IncomeExpenseDoughnutChart;
