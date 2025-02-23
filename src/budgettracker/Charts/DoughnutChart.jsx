import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  FaMoneyBill,
  FaShoppingCart,
  FaUtensils,
  FaCar,
  FaCoins,
  FaChartLine,
  FaHome,
  FaGift,
  FaUniversity,
  FaWifi,
  FaPhone,
  FaChild,
  FaHamburger,
  FaFilm,
  FaPlane,
  FaDumbbell,
  FaHeart,
  FaPaw,
  FaWallet,
  FaBriefcase,
  FaStethoscope,
  FaHandHoldingUsd,
  FaPiggyBank,
} from "react-icons/fa";

// Register the necessary components
Chart.register(ArcElement, Tooltip, Legend);

const categoryIcons = {
  "Rent/Mortgage": <FaHome />,
  Utilities: <FaWifi />,
  Groceries: <FaShoppingCart />,
  Transportation: <FaCar />,
  Insurance: <FaStethoscope />,
  "Medical Expenses": <FaStethoscope />,
  Internet: <FaWifi />,
  "Phone Bill": <FaPhone />,
  Childcare: <FaChild />,
  "Loan Payments": <FaUniversity />,
  "Dining Out": <FaHamburger />,
  Entertainment: <FaFilm />,
  Shopping: <FaShoppingCart />,
  Travel: <FaPlane />,
  "Gym/Fitness": <FaDumbbell />,
  Subscriptions: <FaFilm />,
  "Gifts/Donations": <FaGift />,
  "Personal Care": <FaHeart />,
  "Pet Expenses": <FaPaw />,
  "Other Expenses": <FaWallet />,
};

const DoughnutChart = ({ userId }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });

  const [categoryDetails, setCategoryDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => doc.data());

      const categoryData = {};

      transactions.forEach((transaction) => {
        if (transaction.type === "Expense") {
          categoryData[transaction.category] =
            (categoryData[transaction.category] || 0) + transaction.amount;
        }
      });

      const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const labels = sortedCategories.map(([category]) => category);
      const values = sortedCategories.map(([, amount]) => amount);
      const total = values.reduce((acc, value) => acc + value, 0);

      setData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map(
              () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
            ),
          },
        ],
      });

      setCategoryDetails(
        labels.map((label, index) => ({
          label,
          value: ((categoryData[label] / total) * 100).toFixed(2),
          icon: categoryIcons[label],
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        }))
      );
    };

    fetchData();
  }, [userId]);

  return (
    <div style={{ width: "100%", maxWidth: "250px", margin: "0 auto" }}>
      <Doughnut data={data} />
      <div className="category-details">
        {categoryDetails.map((detail, index) => (
          <div
            key={index}
            className="category-detail"
            style={{ display: "flex", alignItems: "center", margin: "10px 0" }}
          >
            <div style={{ marginRight: "10px", color: detail.color }}>
              {detail.icon}
            </div>
            <div>
              {detail.label}: {detail.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughnutChart;
