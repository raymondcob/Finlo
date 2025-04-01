import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { categoryIcons } from "../Transactions";
import { useTranslation } from "react-i18next";
import { FaChartPie, FaWallet } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend);

// Category mappings for translations and icons
const CATEGORIES = {
  income: {
    en: {
      salary: ["Salary", "salary"],
      freelanceincome: ["Freelance Income", "freelanceincome"],
      bonus: ["Bonus", "bonus"],
      investmentincome: ["Investment Income", "investmentincome"],
      rentalincome: ["Rental Income", "rentalincome"],
      dividends: ["Dividends", "dividends"],
      interestincome: ["Interest Income", "interestincome"],
      gifts: ["Gifts", "gifts"],
      refunds: ["Refunds", "refunds"],
      otherincome: ["Other Income", "otherincome"],
    },
    es: {
      salary: ["Salario", "salary"],
      freelanceincome: ["Ingresos Freelance", "freelanceincome"],
      bonus: ["Bonificación", "bonus"],
      investmentincome: ["Ingresos de Inversión", "investmentincome"],
      rentalincome: ["Ingresos por Alquiler", "rentalincome"],
      dividends: ["Dividendos", "dividends"],
      interestincome: ["Ingresos por Intereses", "interestincome"],
      gifts: ["Regalos", "gifts"],
      refunds: ["Reembolsos", "refunds"],
      otherincome: ["Otros Ingresos", "otherincome"],
    },
  },
  essential: {
    en: {
      "rent/mortgage": ["Rent/Mortgage", "rentmortgage"],
      utilities: ["Utilities", "utilities"],
      groceries: ["Groceries", "groceries"],
      transportation: ["Transportation", "transportation"],
      insurance: ["Insurance", "insurance"],
      medicalexpenses: ["Medical Expenses", "medicalexpenses"],
      internet: ["Internet", "internet"],
      phonebill: ["Phone Bill", "phonebill"],
      childcare: ["Childcare", "childcare"],
      loanpayments: ["Loan Payments", "loanpayments"],
    },
    es: {
      "rent/mortgage": ["Alquiler/Hipoteca", "rentmortgage"],
      utilities: ["Servicios Públicos", "utilities"],
      groceries: ["Comestibles", "groceries"],
      transportation: ["Transporte", "transportation"],
      insurance: ["Seguro", "insurance"],
      medicalexpenses: ["Gastos Médicos", "medicalexpenses"],
      internet: ["Internet", "internet"],
      phonebill: ["Teléfono", "phonebill"],
      childcare: ["Cuidado Infantil", "childcare"],
      loanpayments: ["Pagos de Préstamos", "loanpayments"],
    },
  },
  lifestyle: {
    en: {
      diningout: ["Dining Out", "diningout"],
      entertainment: ["Entertainment", "entertainment"],
      shopping: ["Shopping", "shopping"],
      travel: ["Travel", "travel"],
      gymfitness: ["Gym/Fitness", "gymfitness"],
      subscriptions: ["Subscriptions", "subscriptions"],
      giftsdonations: ["Gifts/Donations", "giftsdonations"],
      personalcare: ["Personal Care", "personalcare"],
      petexpenses: ["Pet Expenses", "petexpenses"],
      otherexpenses: ["Other Expenses", "otherexpenses"],
    },
    es: {
      diningout: ["Restaurantes", "diningout"],
      entertainment: ["Entretenimiento", "entertainment"],
      shopping: ["Compras", "shopping"],
      travel: ["Viajes", "travel"],
      gymfitness: ["Gimnasio/Fitness", "gymfitness"],
      subscriptions: ["Suscripciones", "subscriptions"],
      giftsdonations: ["Regalos/Donaciones", "giftsdonations"],
      personalcare: ["Cuidado Personal", "personalcare"],
      petexpenses: ["Gastos de Mascotas", "petexpenses"],
      otherexpenses: ["Otros Gastos", "otherexpenses"],
    },
  },
};

const generateColors = (count) => {
  const baseColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#33CC99",
    "#FF99CC",
    "#66CCFF",
    "#FFCC99",
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }

  return colors;
};

const DoughnutChart = ({ userId, type }) => {
  const { t, i18n } = useTranslation();
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

  const getCategoryInfo = (category, type) => {
    const lang = i18n.language.split("-")[0];
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, "");

    if (type === "Income") {
      return (
        CATEGORIES.income[lang]?.[normalizedCategory] || [
          category,
          normalizedCategory,
        ]
      );
    }

    const essentialInfo = CATEGORIES.essential[lang]?.[normalizedCategory];
    if (essentialInfo) return essentialInfo;

    return (
      CATEGORIES.lifestyle[lang]?.[normalizedCategory] || [
        category,
        normalizedCategory,
      ]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const transactionsRef = collection(db, "transactions");
        const q = query(
          transactionsRef,
          where("userId", "==", userId),
          where("type", "==", type)
        );
        const querySnapshot = await getDocs(q);
        const categoryTotals = {};

        querySnapshot.forEach((doc) => {
          const transaction = doc.data();
          if (!transaction.category) return;

          const [translatedName, iconKey] = getCategoryInfo(
            transaction.category,
            type
          );

          if (!categoryTotals[translatedName]) {
            categoryTotals[translatedName] = {
              amount: 0,
              iconKey,
            };
          }
          categoryTotals[translatedName].amount +=
            Number(transaction.amount) || 0;
        });

        if (Object.keys(categoryTotals).length > 0) {
          const labels = Object.keys(categoryTotals);
          const amounts = labels.map((label) => categoryTotals[label].amount);
          const iconKeys = labels.map((label) => categoryTotals[label].iconKey);

          setData({
            labels,
            datasets: [
              {
                data: amounts,
                backgroundColor: generateColors(labels.length),
                iconKeys,
              },
            ],
          });
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
      }
    };

    fetchData();
  }, [userId, type, t, i18n.language]);

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

  const hasData = data && data.datasets[0].data.length > 0;

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
          const iconKey = data.datasets[0].iconKeys[index];
          const IconComponent = categoryIcons[iconKey] || FaWallet;

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
                <IconComponent className="w-2.5 h-2.5 text-white" />
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
