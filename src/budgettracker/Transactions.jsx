import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import AddTransactionModal from "./modals/AddTransactionModal";
import { Card, List, Typography, Table, Tag, Button } from "antd";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import {
  FaMoneyBill,
  FaHandHoldingMedical,
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
  FaPlus,
  FaHandHoldingWater,
} from "react-icons/fa";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

// Consistent icon mapping for all components
export const categoryIcons = {
  // Income Categories
  salary: FaBriefcase,
  freelanceincome: FaMoneyBill,
  bonus: FaCoins,
  investmentincome: FaChartLine,
  rentalincome: FaHome,
  dividends: FaHandHoldingUsd,
  interestincome: FaPiggyBank,
  gifts: FaGift,
  refunds: FaUniversity,
  otherincome: FaWallet,

  // Essential expenses
  "rent/mortgage": FaHome,
  utilities: FaHandHoldingWater,
  groceries: FaShoppingCart,
  transportation: FaCar,
  insurance: FaHandHoldingMedical,
  medicalexpenses: FaStethoscope,
  internet: FaWifi,
  phonebill: FaPhone,
  childcare: FaChild,
  loanpayments: FaUniversity,

  // Lifestyle expenses
  diningout: FaHamburger,
  entertainment: FaFilm,
  shopping: FaShoppingCart,
  travel: FaPlane,
  "gym/fitness": FaDumbbell,
  subscriptions: FaFilm,
  "gifts/donations": FaGift,
  personalcare: FaHeart,
  petexpenses: FaPaw,
  otherexpenses: FaWallet,
};

const Transactions = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({ balance: 0 });
  const [walletDetails, setWalletDetails] = useState({ balance: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Define category options - matching exactly with translation file
  const incomeCategories = [
    { label: t("transactions.categories.income.salary"), value: "salary" },
    {
      label: t("transactions.categories.income.freelanceincome"),
      value: "freelanceincome",
    },
    { label: t("transactions.categories.income.bonus"), value: "bonus" },
    {
      label: t("transactions.categories.income.investmentincome"),
      value: "investmentincome",
    },
    {
      label: t("transactions.categories.income.rentalincome"),
      value: "rentalincome",
    },
    {
      label: t("transactions.categories.income.dividends"),
      value: "dividends",
    },
    {
      label: t("transactions.categories.income.interestincome"),
      value: "interestincome",
    },
    { label: t("transactions.categories.income.gifts"), value: "gifts" },
    { label: t("transactions.categories.income.refunds"), value: "refunds" },
    {
      label: t("transactions.categories.income.otherincome"),
      value: "otherincome",
    },
  ];

  const essentialExpenses = [
    {
      label: t("transactions.categories.essential.rent/mortgage"),
      value: "rent/mortgage",
    },
    {
      label: t("transactions.categories.essential.utilities"),
      value: "utilities",
    },
    {
      label: t("transactions.categories.essential.groceries"),
      value: "groceries",
    },
    {
      label: t("transactions.categories.essential.transportation"),
      value: "transportation",
    },
    {
      label: t("transactions.categories.essential.insurance"),
      value: "insurance",
    },
    {
      label: t("transactions.categories.essential.medicalexpenses"),
      value: "medicalexpenses",
    },
    {
      label: t("transactions.categories.essential.internet"),
      value: "internet",
    },
    {
      label: t("transactions.categories.essential.phonebill"),
      value: "phonebill",
    },
    {
      label: t("transactions.categories.essential.childcare"),
      value: "childcare",
    },
    {
      label: t("transactions.categories.essential.loanpayments"),
      value: "loanpayments",
    },
  ];

  const lifestyleExpenses = [
    {
      label: t("transactions.categories.lifestyle.diningout"),
      value: "diningout",
    },
    {
      label: t("transactions.categories.lifestyle.entertainment"),
      value: "entertainment",
    },
    {
      label: t("transactions.categories.lifestyle.shopping"),
      value: "shopping",
    },
    { label: t("transactions.categories.lifestyle.travel"), value: "travel" },
    {
      label: t("transactions.categories.lifestyle.gym/fitness"),
      value: "gym/fitness",
    },
    {
      label: t("transactions.categories.lifestyle.subscriptions"),
      value: "subscriptions",
    },
    {
      label: t("transactions.categories.lifestyle.gifts/donations"),
      value: "gifts/donations",
    },
    {
      label: t("transactions.categories.lifestyle.personalcare"),
      value: "personalcare",
    },
    {
      label: t("transactions.categories.lifestyle.petexpenses"),
      value: "petexpenses",
    },
    {
      label: t("transactions.categories.lifestyle.otherexpenses"),
      value: "otherexpenses",
    },
  ];

  useEffect(() => {
    if (user) {
      const fetchDetails = async () => {
        try {
          const [cardDoc, walletDoc] = await Promise.all([
            getDoc(doc(db, "cardDetails", user.uid)),
            getDoc(doc(db, "walletDetails", user.uid)),
          ]);

          if (cardDoc.exists()) {
            setCardDetails(cardDoc.data());
          }
          if (walletDoc.exists()) {
            setWalletDetails(walletDoc.data());
          }
        } catch (error) {
          toast.error("Failed to load account details");
        }
      };
      fetchDetails();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        try {
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const transactionsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTransactions(transactionsData);
        } catch (error) {
          toast.error("Failed to load transactions");
        }
      };
      fetchTransactions();
    }
  }, [user]);

  // Add window resize listener with cleanup
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Add this helper function for better date handling
  const parseTransactionDate = (dateValue) => {
    try {
      // Handle Firestore Timestamp
      if (dateValue?.toDate) {
        return dateValue.toDate();
      }
      // Handle number (timestamp)
      if (typeof dateValue === "number") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) return date;
      }
      // Handle string date
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) return date;
      }
      // Handle Date object
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Add this helper function for category translation debugging
  const getTranslatedCategory = (category, type) => {
    try {
      // Normalize the category name
      const normalizedCategory = category
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

      // Determine category type
      let categoryType = "lifestyle";
      if (type === "Income") {
        categoryType = "income";
      } else if (
        essentialExpenses.some(
          (c) =>
            c.label.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            normalizedCategory
        )
      ) {
        categoryType = "essential";
      }

      const translationKey = `transactions.categories.${categoryType}.${normalizedCategory}`;
      const translated = t(translationKey);

      return translated;
    } catch (error) {
      return category;
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      if (user) {
        const dateValue = new Date(transaction.date);
        if (isNaN(dateValue.getTime())) {
          throw new Error("Invalid transaction date");
        }

        const newTransaction = {
          ...transaction,
          userId: user.uid,
          date: dateValue,
          amount: Number.parseFloat(transaction.amount),
          category: transaction.category,
        };

        if (transaction.type === "Income") {
          if (transaction.paymentMethod === "Card") {
            const newBalance = (
              Number.parseFloat(cardDetails.balance) + transaction.amount
            ).toFixed(2);
            setCardDetails((prevDetails) => ({
              ...prevDetails,
              balance: newBalance,
            }));
            await updateDoc(doc(db, "cardDetails", user.uid), {
              balance: newBalance,
            });
          } else if (transaction.paymentMethod === "Wallet") {
            const newBalance = (
              Number.parseFloat(walletDetails.balance) + transaction.amount
            ).toFixed(2);
            setWalletDetails((prevDetails) => ({
              ...prevDetails,
              balance: newBalance,
            }));
            await updateDoc(doc(db, "walletDetails", user.uid), {
              balance: newBalance,
            });
          }
        } else if (transaction.type === "Expense") {
          if (transaction.paymentMethod === "Card") {
            const currentBalance = Number.parseFloat(cardDetails.balance);
            if (newTransaction.amount > currentBalance) {
              return;
            }
            const newBalance = (
              Number.parseFloat(cardDetails.balance) - transaction.amount
            ).toFixed(2);
            setCardDetails((prevDetails) => ({
              ...prevDetails,
              balance: newBalance,
            }));
            await updateDoc(doc(db, "cardDetails", user.uid), {
              balance: newBalance,
            });
          } else if (transaction.paymentMethod === "Wallet") {
            const currentBalance = Number.parseFloat(walletDetails.balance);
            if (newTransaction.amount > currentBalance) {
              return;
            }
            const newBalance = (
              Number.parseFloat(walletDetails.balance) - transaction.amount
            ).toFixed(2);
            setWalletDetails((prevDetails) => ({
              ...prevDetails,
              balance: newBalance,
            }));
            await updateDoc(doc(db, "walletDetails", user.uid), {
              balance: newBalance,
            });
          }
        }

        await addDoc(collection(db, "transactions"), newTransaction);
        setTransactions((prev) => [...prev, newTransaction]);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Helper function to map old category names to new ones
  const mapLegacyCategory = (category) => {
    const legacyMap = {
      // Income categories
      Salary: "salary",
      "Freelance Income": "freelanceincome",
      "Rental Income": "rentalincome",
      "Investment Income": "investmentincome",
      "Interest Income": "interestincome",
      "Other Income": "otherincome",

      // Essential categories
      "Rent/Mortgage": "rent/mortgage",
      "Medical Expenses": "medicalexpenses",
      "Phone Bill": "phonebill",
      "Loan Payments": "loanpayments",

      // Lifestyle categories
      "Dining Out": "diningout",
      "Gym/Fitness": "gym/fitness",
      "Gifts/Donations": "gifts/donations",
      "Personal Care": "personalcare",
      "Pet Expenses": "petexpenses",
      "Other Expenses": "otherexpenses",
    };

    return legacyMap[category] || category.toLowerCase().replace(/\s+/g, "");
  };

  // Add this function before renderCategoryTag
  const getCategoryColor = (type, categoryType) => {
    if (type === "Income") {
      return "#20b77c"; // green for income
    }
    if (categoryType === "essential") {
      return "#f96a16"; // orange for essential expenses
    }
    return "#0c8de0"; // blue for lifestyle expenses
  };

  // Also add getCategoryIcon function since it's used in renderCategoryTag
  const getCategoryIcon = (category) => {
    const IconComponent = categoryIcons[category] || FaWallet;
    return <IconComponent />;
  };

  const renderCategoryTag = (transaction) => {
    // Ensure we have a valid category
    if (!transaction?.category) return null;

    // Normalize the category by converting to lowercase and removing spaces
    const normalizedCategory = transaction.category
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9/]/g, ""); // Keep slashes for categories like "gym/fitness"

    // Determine category type
    let categoryType = "lifestyle"; // default
    if (transaction.type === "Income") {
      categoryType = "income";
    } else {
      // Check if category exists in essentialExpenses array using normalized comparison
      const isEssential = essentialExpenses.some(
        (cat) => cat.value.toLowerCase() === normalizedCategory
      );
      categoryType = isEssential ? "essential" : "lifestyle";
    }

    return (
      <Tag
        key={`${transaction.id}-${normalizedCategory}`}
        color={getCategoryColor(transaction.type, categoryType)}
        className="flex items-center gap-2 w-max rounded-full px-2 py-1"
      >
        {getCategoryIcon(normalizedCategory)}
        <span className="text-sm font-inter font-normal text-white">
          {transaction.type.toLowerCase() === "income"
            ? t(`transactions.categories.income.${normalizedCategory}`)
            : t(
                `transactions.categories.${categoryType}.${normalizedCategory}`
              )}
        </span>
      </Tag>
    );
  };

  const renderTypeTag = (type) => (
    <div
      className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium"
      style={{
        backgroundColor:
          type === "Income" ? "rgba(32, 183, 124, 0.1)" : "rgba(249, 106, 22, 0.1)",
        border: `1px solid ${
          type === "Income" ? "rgba(32, 183, 124, 0.3)" : "rgba(249, 106, 22, 0.3)"
        }`,
        backdropFilter: "blur(6px)",
      }}
    >
      <span className={type === "Income" ? "text-green-600" : "text-orange-600"}>
        {t(`transactions.type.${type.toLowerCase()}`)}
      </span>
    </div>
  );

  const renderPaymentMethodTag = (method) => (
    <div
      className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium"
      style={{
        backgroundColor:
          method === "Card" ? "rgba(12, 141, 224, 0.1)" : "rgba(32, 183, 124, 0.1)",
        border: `1px solid ${
          method === "Card" ? "rgba(12, 141, 224, 0.3)" : "rgba(32, 183, 124, 0.3)"
        }`,
        backdropFilter: "blur(6px)",
      }}
    >
      <span className={method === "Card" ? "text-blue-600" : "text-green-600"}>
        {t(`transactions.payment.${method.toLowerCase()}`)}
      </span>
    </div>
  );

  const getLocale = (language) => {
    const locales = {
      en: enUS,
      es: es,
      fr: fr,
      // Add other mappings as needed
    };
    return locales[language] || enUS;
  };

  // Format date for mobile view - shorter format
  const formatMobileDate = (date) => {
    const parsedDate = parseTransactionDate(date);
    if (!parsedDate) return "Invalid";

    // Use a shorter date format for mobile
    return format(parsedDate, "MMM d", { locale: getLocale(i18n.language) });
  };

  const columns = [
    {
      title: t("transactions.category"),
      dataIndex: "category",
      key: "category",
      filters: [
        {
          text: t("transactions.categories.income.title"),
          value: "Income",
          children: incomeCategories.map((cat) => ({
            text: cat.label,
            value: cat.value,
            key: `income-${cat.value}`,
          })),
        },
        {
          text: t("transactions.categories.essential.title"),
          value: "Essential Expenses",
          children: essentialExpenses.map((cat) => ({
            text: cat.label,
            value: cat.value,
            key: `essential-${cat.value}`,
          })),
        },
        {
          text: t("transactions.categories.lifestyle.title"),
          value: "Lifestyle Expenses",
          children: lifestyleExpenses.map((cat) => ({
            text: cat.label,
            value: cat.value,
            key: `lifestyle-${cat.value}`,
          })),
        },
      ],
      onFilter: (value, record) => {
        const normalizedCategory = mapLegacyCategory(record.category);
        if (value === "Income") {
          return incomeCategories.some(
            (cat) => cat.value === normalizedCategory
          );
        } else if (value === "Essential Expenses") {
          return essentialExpenses.some(
            (cat) => cat.value === normalizedCategory
          );
        } else if (value === "Lifestyle Expenses") {
          return lifestyleExpenses.some(
            (cat) => cat.value === normalizedCategory
          );
        }
        return normalizedCategory === value;
      },
      render: (category, record) => renderCategoryTag(record),
    },
    {
      title: t("transactions.tabletype"),
      dataIndex: "type",
      key: "type",
      filters: [
        { text: t("transactions.type.expense"), value: "Expense" },
        { text: t("transactions.type.income"), value: "Income" },
      ],
      onFilter: (value, record) => record.type.includes(value),
      render: (type) => renderTypeTag(type),
    },
    {
      title: t("transactions.provider"),
      dataIndex: "provider",
      key: "provider",
      render: (provider) => (
        <span className="text-gray-800 dark:text-gray-200">
          {provider || t("transactions.untitled")}
        </span>
      ),
    },
    {
      title: t("transactions.paymentMethod"),
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      filters: [
        { text: t("transactions.payment.wallet"), value: "Wallet" },
        { text: t("transactions.payment.card"), value: "Card" },
      ],
      onFilter: (value, record) => record.paymentMethod.includes(value),
      render: (method) => renderPaymentMethodTag(method),
    },
    {
      title: t("transactions.date"),
      dataIndex: "date",
      key: "date",
      defaultSortOrder: "descend",
      render: (date) => {
        const parsedDate = parseTransactionDate(date);
        if (!parsedDate) {
          return "Invalid Date";
        }

        const locale = getLocale(i18n.language);
        return format(parsedDate, "PPP", { locale });
      },
      sorter: (a, b) => {
        const dateA = parseTransactionDate(a.date);
        const dateB = parseTransactionDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateB - dateA;
      },
      filters: [
        {
          text: t("transactions.dateFilters.last7days"),
          value: "7days",
        },
        {
          text: t("transactions.dateFilters.last30days"),
          value: "30days",
        },
        {
          text: t("transactions.dateFilters.last90days"),
          value: "90days",
        },
      ],
      onFilter: (value, record) => {
        const transactionDate = parseTransactionDate(record.date);
        const now = new Date();
        const diffTime = Math.abs(now - transactionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (value) {
          case "7days":
            return diffDays <= 7;
          case "30days":
            return diffDays <= 30;
          case "90days":
            return diffDays <= 90;
          default:
            return true;
        }
      },
    },
    {
      title: t("transactions.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <span
          className={
            record.type === "Income"
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {record.type === "Income" ? "+" : "-"}${amount.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  const renderMobileList = () => (
    <List
      dataSource={transactions.sort((a, b) => {
        const dateA = parseTransactionDate(a.date);
        const dateB = parseTransactionDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateB - dateA;
      })}
      renderItem={(item) => (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-4"
        >
          <Card className="w-full shadow-md dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {renderCategoryTag(item)}
                {renderTypeTag(item.type)}
              </div>
              <Text strong className="dark:text-gray-200 text-xs">
                {formatMobileDate(item.date)}
              </Text>
            </div>
            <div className="flex justify-between items-center mb-2">
              <Text className="text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                {item.provider}
              </Text>
              {renderPaymentMethodTag(item.paymentMethod)}
            </div>
            <div className="flex justify-end items-center">
              <Text
                className={`text-lg font-semibold ${
                  item.type === "Income"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {item.type === "Income" ? "+" : "-"}${item.amount.toFixed(2)}
              </Text>
            </div>
          </Card>
        </motion.div>
      )}
    />
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <Title level={2} className="mb-4 md:mb-0 text-gray-800 dark:text-white">
          {t("transactions.title")}
        </Title>
        <Button
          type="default"
          onClick={() => setIsModalOpen(true)}
          className="bg-transparent hover:bg-finance-blue-50 dark:hover:bg-finance-blue-900/30 text-finance-blue-600 dark:text-finance-blue-400 border-2 border-dashed border-finance-blue-300 dark:border-finance-blue-700 hover:border-finance-blue-500 dark:hover:border-finance-blue-500 flex items-center gap-2"
          icon={<FaPlus />}
        >
          {t("transactions.addtransaction")}
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
      >
        {isMobile ? (
          renderMobileList()
        ) : (
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey={(record) => record.id}
            pagination={{ pageSize: 6 }}
            scroll={{ x: true }}
          />
        )}
      </motion.div>

      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        cardBalance={cardDetails.balance}
        walletBalance={walletDetails.balance}
      />
    </div>
  );
};

export default Transactions;
