import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

// Register the necessary components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ userId }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: "Income",
        data: [],
        borderColor: "green",
        fill: false,
      },
      {
        label: "Expenses",
        data: [],
        borderColor: "red",
        fill: false,
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

      const incomeData = {};
      const expenseData = {};

      transactions.forEach((transaction) => {
        const year = new Date(transaction.date).getFullYear();
        if (transaction.type === "Income") {
          incomeData[year] = (incomeData[year] || 0) + transaction.amount;
        } else if (transaction.type === "Expense") {
          expenseData[year] = (expenseData[year] || 0) + transaction.amount;
        }
      });

      const labels = Array.from(
        new Set([...Object.keys(incomeData), ...Object.keys(expenseData)])
      ).sort();
      const incomeValues = labels.map((year) => incomeData[year] || 0);
      const expenseValues = labels.map((year) => expenseData[year] || 0);

      setData({
        labels,
        datasets: [
          {
            label: "Income",
            data: incomeValues,
            borderColor: "green",
            fill: false,
          },
          {
            label: "Expenses",
            data: expenseValues,
            borderColor: "red",
            fill: false,
          },
        ],
      });
    };

    fetchData();
  }, [userId]);

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <Line data={data} />
    </div>
  );
};

export default LineChart;
