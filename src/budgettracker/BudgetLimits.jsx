import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Card, Progress, Button, Input, Modal, Form, Select } from "antd";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaShoppingCart,
  FaHome,
  FaCar,
  FaUtensils,
  FaFilm,
  FaHeart,
  FaDumbbell,
  FaPaw,
  FaWifi,
  FaPhone,
  FaChild,
  FaUniversity,
  FaStethoscope,
  FaHamburger,
  FaPlane,
  FaGift,
  FaWallet,
} from "react-icons/fa";
import toast from "react-hot-toast";

const { Option } = Select;

const BudgetLimits = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [budgets, setBudgets] = useState({});
  const [spending, setSpending] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);

  const frequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const calculateNextResetDate = (frequency) => {
    const now = new Date();
    const nextReset = new Date(now);

    switch (frequency) {
      case "weekly":
        nextReset.setDate(now.getDate() + (8 - now.getDay()));
        break;
      case "monthly":
        nextReset.setMonth(now.getMonth() + 1, 1);
        break;
      case "yearly":
        nextReset.setFullYear(now.getFullYear() + 1, 0, 1);
        break;
      default:
        return Timestamp.fromDate(now);
    }
    return Timestamp.fromDate(nextReset);
  };

  const categories = {
    essential: {
      title: t("transactions.categories.essential.title"),
      items: [
        {
          key: "rent_mortgage",
          name: t("transactions.categories.essential.rent/mortgage"),
          icon: <FaHome className="text-finance-blue-500" />,
        },
        {
          key: "utilities",
          name: t("transactions.categories.essential.utilities"),
          icon: <FaWifi className="text-finance-blue-500" />,
        },
        {
          key: "groceries",
          name: t("transactions.categories.essential.groceries"),
          icon: <FaShoppingCart className="text-finance-blue-500" />,
        },
        {
          key: "transportation",
          name: t("transactions.categories.essential.transportation"),
          icon: <FaCar className="text-finance-blue-500" />,
        },
        {
          key: "insurance",
          name: t("transactions.categories.essential.insurance"),
          icon: <FaStethoscope className="text-finance-blue-500" />,
        },
        {
          key: "medical_expenses",
          name: t("transactions.categories.essential.medicalexpenses"),
          icon: <FaStethoscope className="text-finance-blue-500" />,
        },
        {
          key: "internet",
          name: t("transactions.categories.essential.internet"),
          icon: <FaWifi className="text-finance-blue-500" />,
        },
        {
          key: "phone_bill",
          name: t("transactions.categories.essential.phonebill"),
          icon: <FaPhone className="text-finance-blue-500" />,
        },
        {
          key: "childcare",
          name: t("transactions.categories.essential.childcare"),
          icon: <FaChild className="text-finance-blue-500" />,
        },
        {
          key: "loan_payments",
          name: t("transactions.categories.essential.loanpayments"),
          icon: <FaUniversity className="text-finance-blue-500" />,
        },
      ],
    },
    lifestyle: {
      title: t("transactions.categories.lifestyle.title"),
      items: [
        {
          key: "dining_out",
          name: t("transactions.categories.lifestyle.diningout"),
          icon: <FaHamburger className="text-finance-blue-500" />,
        },
        {
          key: "entertainment",
          name: t("transactions.categories.lifestyle.entertainment"),
          icon: <FaFilm className="text-finance-blue-500" />,
        },
        {
          key: "shopping",
          name: t("transactions.categories.lifestyle.shopping"),
          icon: <FaShoppingCart className="text-finance-blue-500" />,
        },
        {
          key: "travel",
          name: t("transactions.categories.lifestyle.travel"),
          icon: <FaPlane className="text-finance-blue-500" />,
        },
        {
          key: "gym_fitness",
          name: t("transactions.categories.lifestyle.gym/fitness"),
          icon: <FaDumbbell className="text-finance-blue-500" />,
        },
        {
          key: "subscriptions",
          name: t("transactions.categories.lifestyle.subscriptions"),
          icon: <FaFilm className="text-finance-blue-500" />,
        },
        {
          key: "gifts_donations",
          name: t("transactions.categories.lifestyle.gifts/donations"),
          icon: <FaGift className="text-finance-blue-500" />,
        },
        {
          key: "personal_care",
          name: t("transactions.categories.lifestyle.personalcare"),
          icon: <FaHeart className="text-finance-blue-500" />,
        },
        {
          key: "pet_expenses",
          name: t("transactions.categories.lifestyle.petexpenses"),
          icon: <FaPaw className="text-finance-blue-500" />,
        },
        {
          key: "other_expenses",
          name: t("transactions.categories.lifestyle.otherexpenses"),
          icon: <FaWallet className="text-finance-blue-500" />,
        },
      ],
    },
  };

  const handleSetLimit = async (values) => {
    if (!user) return;

    try {
      const budgetDocRef = doc(db, "budgetLimits", user.uid);
      const limitValue = Number(values.limit);
      const frequency = values.frequency || "monthly";

      const nextResetDate = calculateNextResetDate(frequency);

      const budgetData = {
        amount: limitValue,
        frequency: frequency,
        startDate: Timestamp.fromDate(new Date()),
        nextResetDate: nextResetDate,
        spent: 0,
      };

      const currentDoc = await getDoc(budgetDocRef);
      const currentBudgets = currentDoc.exists() ? currentDoc.data() : {};

      const updatedBudgets = {
        ...currentBudgets,
        [values.category]: budgetData,
      };

      await setDoc(budgetDocRef, updatedBudgets);

      setBudgets(updatedBudgets);
      setIsModalVisible(false);
      form.resetFields();
      toast.success(t("budgets.limitSet"));
    } catch (error) {
      toast.error(t("budgets.limitSetError"));
    }
  };

  const findCategoryKeyByName = (categoryName) => {
    if (!categoryName) return null;

    const normalizeString = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_|_$/g, "");

    const normalizedCategoryName = normalizeString(categoryName);
    const categoryMapping = {};

    Object.values(categories).forEach((group) => {
      group.items.forEach((item) => {
        categoryMapping[normalizeString(item.name)] = item.key;
        categoryMapping[item.key] = item.key;
        categoryMapping[item.name.toLowerCase()] = item.key;
      });
    });

    return (
      categoryMapping[normalizedCategoryName] ||
      categoryMapping[categoryName.toLowerCase()] ||
      null
    );
  };

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const budgetDocRef = doc(db, "budgetLimits", user.uid);
    const transactionsRef = collection(db, "transactions");

    const unsubscribe = onSnapshot(budgetDocRef, async (budgetDoc) => {
      try {
        const currentBudgets = budgetDoc.exists() ? budgetDoc.data() : {};
        setBudgets(currentBudgets);

        const q = query(
          transactionsRef,
          where("userId", "==", user.uid),
          where("type", "==", "Expense")
        );

        const transactionDocs = await getDocs(q);
        const currentSpending = {};

        transactionDocs.forEach((doc) => {
          const transaction = doc.data();
          const transactionDate = transaction.date?.toDate();
          const categoryKey = findCategoryKeyByName(transaction.category);

          if (categoryKey && currentBudgets[categoryKey]) {
            const budget = currentBudgets[categoryKey];

            const resetDate = budget.nextResetDate?.toDate();
            let periodStart;

            switch (budget.frequency) {
              case "weekly":
                periodStart = new Date(resetDate);
                periodStart.setDate(resetDate.getDate() - 7);
                break;
              case "monthly":
                periodStart = new Date(resetDate);
                periodStart.setMonth(resetDate.getMonth() - 1);
                break;
              case "yearly":
                periodStart = new Date(resetDate);
                periodStart.setFullYear(resetDate.getFullYear() - 1);
                break;
              default:
                return;
            }

            const normalizedTransactionDate = new Date(transactionDate);
            const normalizedPeriodStart = new Date(periodStart);
            const normalizedResetDate = new Date(resetDate);

            [
              normalizedTransactionDate,
              normalizedPeriodStart,
              normalizedResetDate,
            ].forEach((date) => {
              date.setHours(0, 0, 0, 0);
            });

            if (
              normalizedTransactionDate >= normalizedPeriodStart &&
              normalizedTransactionDate <= normalizedResetDate
            ) {
              currentSpending[categoryKey] =
                (currentSpending[categoryKey] || 0) +
                Number(transaction.amount || 0);
            }
          }
        });

        setSpending(currentSpending);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const calculateProgress = (categoryKey) => {
    const limit = Number(budgets[categoryKey] || 0);
    const spent = Number(spending[categoryKey] || 0);

    return {
      percentage: limit ? Math.min((spent / limit) * 100, 100) : 0,
      spent,
      limit,
    };
  };

  const renderCategoryCard = (item) => {
    const budget = budgets[item.key];
    const spendingValue = Number(spending[item.key] || 0);

    if (isLoading) {
      return (
        <Card key={item.key} className="dark:bg-gray-700 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </Card>
      );
    }

    if (!budget || !budget.nextResetDate) {
      return (
        <Card key={item.key} className="dark:bg-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            {item.icon}
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {item.name}
            </span>
          </div>
          <Button
            type="default"
            block
            onClick={() => {
              setIsModalVisible(true);
              form.setFieldsValue({ category: item.key });
            }}
            className="bg-transparent hover:bg-finance-blue-50 dark:hover:bg-finance-blue-900/30 text-finance-blue-600 dark:text-finance-blue-400 border-2 border-dashed border-finance-blue-300 dark:border-finance-blue-700 hover:border-finance-blue-500 dark:hover:border-finance-blue-500"
          >
            {t("budgets.setLimit")}
          </Button>
        </Card>
      );
    }

    const amount = Number(budget.amount || 0);
    const spent = spendingValue;
    const percentage = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;

    const getPeriodDescription = () => {
      const resetDate = budget.nextResetDate.toDate();
      let startDate;

      switch (budget.frequency) {
        case "weekly":
          startDate = new Date(resetDate);
          startDate.setDate(startDate.getDate() - 7);
          return `${startDate.toLocaleDateString()} - ${resetDate.toLocaleDateString()}`;
        case "monthly":
          startDate = new Date(resetDate);
          startDate.setMonth(startDate.getMonth() - 1);
          return `${startDate.toLocaleDateString()} - ${resetDate.toLocaleDateString()}`;
        case "yearly":
          startDate = new Date(resetDate);
          startDate.setFullYear(startDate.getFullYear() - 1);
          return `${startDate.toLocaleDateString()} - ${resetDate.toLocaleDateString()}`;
        default:
          return "Unknown period";
      }
    };

    return (
      <Card key={item.key} className="dark:bg-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          {item.icon}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {item.name}
          </span>
        </div>
        <div className="mb-2">
          <span className="text-sm text-gray-500">
            {t(`budgets.frequency.${budget.frequency}`)} •{" "}
            {getPeriodDescription()}
          </span>
        </div>
        <Progress
          percent={percentage}
          status={percentage > 100 ? "exception" : "normal"}
          format={() => `$${spent.toFixed(2)}`}
          strokeColor={{
            "0%": "#108ee9",
            "100%":
              percentage >= 100
                ? "#ff4d4f"
                : percentage >= 80
                ? "#faad14"
                : "#52c41a",
          }}
        />
        <p
          className={`text-sm ${
            percentage >= 100
              ? "text-red-500"
              : "text-gray-600 dark:text-gray-300"
          } mt-2`}
        >
          ${spent.toFixed(2)} / ${amount.toFixed(2)}
        </p>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 bg-gray-50 dark:bg-gray-900"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {t("budgets.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("budgets.subtitle")}
            </p>
          </div>
          <Button
            type="default"
            onClick={() => setIsModalVisible(true)}
            className="bg-transparent hover:bg-finance-blue-50 dark:hover:bg-finance-blue-900/30 text-finance-blue-600 dark:text-finance-blue-400 border-2 border-dashed border-finance-blue-300 dark:border-finance-blue-700 hover:border-finance-blue-500 dark:hover:border-finance-blue-500"
          >
            {t("budgets.setLimit")}
          </Button>
        </div>

        {Object.entries(categories).map(([groupKey, group]) => (
          <div key={group.title} className="mb-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 ">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => renderCategoryCard(item))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={t("budgets.setLimitTitle")}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSetLimit} layout="vertical">
          <Form.Item
            name="category"
            label={t("budgets.category")}
            rules={[{ required: true, message: t("budgets.categoryRequired") }]}
          >
            <Select className="w-full">
              {Object.entries(categories).map(([groupKey, group]) => (
                <Select.OptGroup key={groupKey} label={group.title}>
                  {group.items.map((item) => (
                    <Option key={item.key} value={item.key}>
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    </Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="frequency"
            label={t("budgets.setBudgetFrequency")}
            rules={[
              { required: true, message: t("budgets.frequencyRequired") },
            ]}
            initialValue="monthly"
          >
            <Select>
              {frequencies.map((freq) => (
                <Option key={freq.value} value={freq.value}>
                  {freq.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="limit"
            label={t("budgets.limit")}
            rules={[
              { required: true, message: t("budgets.limitRequired") },
              {
                type: "number",
                min: 0,
                message: t("budgets.limitInvalid"),
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input
              type="number"
              prefix="$"
              step="0.01"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalVisible(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-finance-blue-600"
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default BudgetLimits;
