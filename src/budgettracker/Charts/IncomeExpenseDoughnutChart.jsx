import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

// Register the necessary components
Chart.register(ArcElement, Tooltip, Legend);

const IncomeExpenseDoughnutChart = ({ userId }) => {
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
        labels: ["Income", "Expenses"],
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

  return (
    <div style={{ width: "100%", maxWidth: "220px", margin: "0 auto" }}>
      <Doughnut data={data} />
    </div>
  );
};

export default IncomeExpenseDoughnutChart;