"use client";

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
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
  FaChartPie,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ userId, type }) => {
  const { t } = useTranslation();
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
  });

  const categoryIcons = {
    // Income Categories
    [t("reports.charts.categories.income.Salary")]: FaMoneyBill,
    [t("reports.charts.categories.income.Freelance Income")]: FaBriefcase,
    [t("reports.charts.categories.income.Bonus")]: FaCoins,
    [t("reports.charts.categories.income.Investment Income")]: FaChartLine,
    [t("reports.charts.categories.income.Rental Income")]: FaHome,
    [t("reports.charts.categories.income.Dividends")]: FaHandHoldingUsd,
    [t("reports.charts.categories.income.Interest Income")]: FaPiggyBank,
    [t("reports.charts.categories.income.Gifts")]: FaGift,
    [t("reports.charts.categories.income.Refunds")]: FaUniversity,
    [t("reports.charts.categories.income.Other Income")]: FaWallet,

    // Expense Categories
    [t("reports.charts.categories.expense.Rent/Mortgage")]: FaHome,
    [t("reports.charts.categories.expense.Utilities")]: FaWifi,
    [t("reports.charts.categories.expense.Groceries")]: FaShoppingCart,
    [t("reports.charts.categories.expense.Transportation")]: FaCar,
    [t("reports.charts.categories.expense.Insurance")]: FaStethoscope,
    [t("reports.charts.categories.expense.Medical Expenses")]: FaStethoscope,
    [t("reports.charts.categories.expense.Internet")]: FaWifi,
    [t("reports.charts.categories.expense.Phone Bill")]: FaPhone,
    [t("reports.charts.categories.expense.Childcare")]: FaChild,
    [t("reports.charts.categories.expense.Loan Payments")]: FaUniversity,
    [t("reports.charts.categories.expense.Dining Out")]: FaHamburger,
    [t("reports.charts.categories.expense.Entertainment")]: FaFilm,
    [t("reports.charts.categories.expense.Shopping")]: FaShoppingCart,
    [t("reports.charts.categories.expense.Travel")]: FaPlane,
    [t("reports.charts.categories.expense.Gym/Fitness")]: FaDumbbell,
    [t("reports.charts.categories.expense.Subscriptions")]: FaFilm,
    [t("reports.charts.categories.expense.Gifts/Donations")]: FaGift,
    [t("reports.charts.categories.expense.Personal Care")]: FaHeart,
    [t("reports.charts.categories.expense.Pet Expenses")]: FaPaw,
    [t("reports.charts.categories.expense.Other Expenses")]: FaWallet,
  };

  const categoryColors = {
    // Income Categories
    [t("reports.charts.categories.income.Salary")]: "rgba(255, 99, 132, 0.8)",
    [t("reports.charts.categories.income.Freelance Income")]: "rgba(54, 162, 235, 0.8)",
    [t("reports.charts.categories.income.Bonus")]: "rgba(255, 206, 86, 0.8)",
    [t("reports.charts.categories.income.Investment Income")]: "rgba(75, 192, 192, 0.8)",
    [t("reports.charts.categories.income.Rental Income")]: "rgba(153, 102, 255, 0.8)",
    [t("reports.charts.categories.income.Dividends")]: "rgba(255, 159, 64, 0.8)",
    [t("reports.charts.categories.income.Interest Income")]: "rgba(201, 203, 207, 0.8)",
    [t("reports.charts.categories.income.Gifts")]: "rgba(255, 99, 132, 0.8)",
    [t("reports.charts.categories.income.Refunds")]: "rgba(54, 162, 235, 0.8)",
    [t("reports.charts.categories.income.Other Income")]: "rgba(255, 206, 86, 0.8)",

    // Expense Categories
    [t("reports.charts.categories.expense.Rent/Mortgage")]: "rgba(75, 192, 192, 0.8)",
    [t("reports.charts.categories.expense.Utilities")]: "rgba(153, 102, 255, 0.8)",
    [t("reports.charts.categories.expense.Groceries")]: "rgba(255, 159, 64, 0.8)",
    [t("reports.charts.categories.expense.Transportation")]: "rgba(201, 203, 207, 0.8)",
    [t("reports.charts.categories.expense.Insurance")]: "rgba(255, 99, 132, 0.8)",
    [t("reports.charts.categories.expense.Medical Expenses")]: "rgba(54, 162, 235, 0.8)",
    [t("reports.charts.categories.expense.Internet")]: "rgba(255, 206, 86, 0.8)",
    [t("reports.charts.categories.expense.Phone Bill")]: "rgba(75, 192, 192, 0.8)",
    [t("reports.charts.categories.expense.Childcare")]: "rgba(153, 102, 255, 0.8)",
    [t("reports.charts.categories.expense.Loan Payments")]: "rgba(255, 159, 64, 0.8)",
    [t("reports.charts.categories.expense.Dining Out")]: "rgba(201, 203, 207, 0.8)",
    [t("reports.charts.categories.expense.Entertainment")]: "rgba(255, 99, 132, 0.8)",
    [t("reports.charts.categories.expense.Shopping")]: "rgba(54, 162, 235, 0.8)",
    [t("reports.charts.categories.expense.Travel")]: "rgba(255, 206, 86, 0.8)",
    [t("reports.charts.categories.expense.Gym/Fitness")]: "rgba(75, 192, 192, 0.8)",
    [t("reports.charts.categories.expense.Subscriptions")]: "rgba(153, 102, 255, 0.8)",
    [t("reports.charts.categories.expense.Gifts/Donations")]: "rgba(255, 159, 64, 0.8)",
    [t("reports.charts.categories.expense.Personal Care")]: "rgba(201, 203, 207, 0.8)",
    [t("reports.charts.categories.expense.Pet Expenses")]: "rgba(255, 99, 132, 0.8)",
    [t("reports.charts.categories.expense.Other Expenses")]: "rgba(54, 162, 235, 0.8)",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("type", "==", type)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => doc.data());

      const categoryData = {};

      transactions.forEach((transaction) => {
        const translatedCategory = t(`reports.charts.categories.${type.toLowerCase()}.${transaction.category}`);
        categoryData[translatedCategory] =
          (categoryData[translatedCategory] || 0) + transaction.amount;
      });

      const labels = Object.keys(categoryData);
      const values = labels.map((category) => categoryData[category]);
      const backgroundColors = labels.map((label) => categoryColors[label]);
      const borderColors = backgroundColors.map((color) =>
        color.replace("0.8", "1")
      );

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
      });
    };

    fetchData();
  }, [userId, type, t]);

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
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
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
  };

  const hasData = data.datasets[0].data.length > 0;

  const renderNoData = () => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FaChartPie className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm md:text-base">
          {t(`reports.charts.noData.${type.toLowerCase()}`)}
        </p>
        <p className="text-xs md:text-sm mt-1">
          {t(`reports.charts.noData.${type.toLowerCase()}Subtitle`)}
        </p>
      </div>
    );
  };

  const renderLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4 max-h-24 overflow-y-auto px-2">
        {data.labels.map((label, index) => {
          const Icon = categoryIcons[label] || FaWallet;
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
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {hasData ? (
        <>
          <div className="w-full h-3/4 flex items-center justify-center">
            <Doughnut data={data} options={options} />
          </div>
          {renderLegend()}
        </>
      ) : (
        renderNoData()
      )}
    </div>
  );
};

export default DoughnutChart;