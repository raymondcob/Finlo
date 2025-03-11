import { useEffect, useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Modal } from "antd";
import {
  ShoppingCartOutlined,
  CoffeeOutlined,
  CarOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  GiftOutlined,
  WalletOutlined,
  BankOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTranslation } from "react-i18next";

const localizer = momentLocalizer(moment);

const categoryIcons = {
  Shopping: <ShoppingCartOutlined />,
  Food: <CoffeeOutlined />,
  Transport: <CarOutlined />,
  Housing: <HomeOutlined />,
  Healthcare: <MedicineBoxOutlined />,
  Entertainment: <GiftOutlined />,
  Salary: <WalletOutlined />,
  Investment: <BankOutlined />,
  Other: <DollarOutlined />,
};

const CustomCalendar = ({ userId }) => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Set moment locale based on current language
  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  // Memoize messages and formats to prevent unnecessary re-renders
  const messages = useMemo(
    () => ({
      today: t("calendar.toolbar.today"),
      previous: t("calendar.toolbar.previous"),
      next: t("calendar.toolbar.next"),
    }),
    [t]
  );

  const formats = useMemo(
    () => ({
      monthHeaderFormat: (date) => {
        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];
        return t(`calendar.labels.month.${monthNames[date.getMonth()]}`);
      },
      dayHeaderFormat: (date) => {
        const weekdays = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const dayIndex = date.getDay();
        return t(`calendar.labels.weekdays.${weekdays[dayIndex]}`).substring(
          0,
          3
        );
      },
      dayFormat: (date) => date.getDate(),
    }),
    [t]
  );

  // Fetch transactions and organize them by date
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;

      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const transactionsByDate = {};

        querySnapshot.docs.forEach((doc) => {
          const data = { ...doc.data(), id: doc.id };

          // Handle the date consistently
          let transactionDate;
          if (data.date?.toDate) {
            transactionDate = data.date.toDate();
          } else {
            transactionDate = new Date(data.date);
          }

          // Use moment to handle the date conversion consistently
          const date = moment(transactionDate)
            .startOf("day")
            .format("YYYY-MM-DD");

          if (!transactionsByDate[date]) {
            transactionsByDate[date] = {
              income: 0,
              expense: 0,
              transactions: [],
            };
          }

          if (data.type === "Income") {
            transactionsByDate[date].income += Number(data.amount);
          } else {
            transactionsByDate[date].expense += Number(data.amount);
          }

          transactionsByDate[date].transactions.push(data);
        });

        const calendarEvents = Object.entries(transactionsByDate).map(
          ([date, data]) => {
            const total = data.income + data.expense;
            const incomePercentage =
              total > 0 ? (data.income / total) * 100 : 0;

            return {
              title: `$${total.toFixed(0)}`,
              start: moment(date).toDate(), // Use moment to handle date conversion
              end: moment(date).toDate(), // Use moment to handle date conversion
              allDay: true,
              resource: {
                income: data.income,
                expense: data.expense,
                transactions: data.transactions,
                date,
                incomePercentage,
              },
            };
          }
        );

        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [userId]);

  const handleSelectSlot = (slotInfo) => {
    const selectedDate = moment(slotInfo.start).format("YYYY-MM-DD");
    const todayDate = moment().format("YYYY-MM-DD");

    const event = events.find(
      (event) => moment(event.start).format("YYYY-MM-DD") === selectedDate
    );

    if (event?.resource.transactions.length > 0) {
      setSelectedDate(selectedDate);
      setSelectedTransactions(event.resource.transactions);
      setIsModalVisible(true);
    } else if (selectedDate === todayDate) {
      setSelectedDate(todayDate);
      setSelectedTransactions([]);
      setIsModalVisible(true);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedDate(null);
    setSelectedTransactions([]);
  };

  // Format date for modal title
  const formatModalDate = (date) => {
    if (!date) return "";

    const momentDate = moment(date).locale(i18n.language);

    if (i18n.language === "es") {
      const day = momentDate.format("D");
      const month = momentDate.format("MMMM").toLowerCase();
      const year = momentDate.format("YYYY");
      const translatedMonth = t(`calendar.labels.month.${month}`);
      return `${day} de ${translatedMonth} de ${year}`;
    }

    return momentDate.format("LL");
  };

  // Get translation key for transaction category
  const getCategoryTranslationKey = (transaction) => {
    if (transaction.type === "Income") {
      return `transactions.categories.income.${transaction.category
        .toLowerCase()
        .replace(/\s+/g, "")}`;
    }

    // Essential expenses categories
    const essentialCategories = [
      "Rent",
      "Mortgage",
      "Utilities",
      "Groceries",
      "Transportation",
      "Insurance",
      "Medical",
      "Internet",
      "Phone",
      "Childcare",
      "Loan Payments",
    ];

    const category = transaction.category;
    const isEssential = essentialCategories.some(
      (ec) => ec.toLowerCase() === category.toLowerCase()
    );

    return `transactions.categories.${
      isEssential ? "essential" : "lifestyle"
    }.${transaction.category.toLowerCase().replace(/\s+/g, "")}`;
  };

  // Render the modal content with transactions
  const renderModalContent = (transactions) => {
    // Calculate totals
    const totalIncome = transactions.reduce(
      (sum, t) => sum + (t.type === "Income" ? t.amount : 0),
      0
    );
    const totalExpense = transactions.reduce(
      (sum, t) => sum + (t.type === "Expense" ? t.amount : 0),
      0
    );
    const total = totalIncome + totalExpense;
    const incomePercentage = (totalIncome / total) * 100 || 0;

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between mb-2">
            <span className="text-green-600 font-medium text-sm sm:text-base">
              {t("calendar.modal.income")}: ${totalIncome.toFixed(2)}
            </span>
            <span className="text-red-600 font-medium text-sm sm:text-base">
              {t("calendar.modal.expense")}: ${totalExpense.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-2 bg-red-500 dark:bg-red-600 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-l"
              style={{ width: `${incomePercentage}%` }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("calendar.modal.total")}: ${total.toFixed(2)}
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id || index}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg text-xs sm:text-sm mb-2 dark:bg-gray-700"
              style={{
                backgroundColor:
                  transaction.type === "Income"
                    ? "rgba(75, 192, 192, 0.1)"
                    : "rgba(255, 99, 132, 0.1)",
                border: `1px solid ${
                  transaction.type === "Income"
                    ? "rgba(75, 192, 192, 0.3)"
                    : "rgba(255, 99, 132, 0.3)"
                }`,
              }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">
                  {categoryIcons[transaction.category] || categoryIcons.Other}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium dark:text-white">
                    {t(getCategoryTranslationKey(transaction))}
                  </span>
                </div>
              </div>
              <span
                className={`font-bold ${
                  transaction.type === "Income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "Income" ? "+" : "-"}$
                {transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-300px)] w-full">
      <style>{`
        :global(.calendar-modal .ant-modal-content) {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }
        :global(.dark .calendar-modal .ant-modal-content) {
          background: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(10px);
        }
        :global(.dark .rbc-off-range-bg) {
          background: #374151;
        }
        :global(.dark .rbc-today) {
          background-color: rgba(59, 130, 246, 0.2);
        }
        :global(.dark .rbc-month-row + .rbc-month-row) {
          border-top: 1px solid #4B5563;
        }
        :global(.dark .rbc-day-bg + .rbc-day-bg) {
          border-left: 1px solid #4B5563;
        }
        :global(.dark .rbc-header) {
          border-bottom: 1px solid #4B5563;
        }
        :global(.dark .rbc-month-view) {
          border: 1px solid #4B5563;
        }
        :global(.dark .ant-tabs-ink-bar) {
          background: #3B82F6;
        }
        .rbc-day-bg.has-events {
          position: relative;
          overflow: hidden;
        }
        .rbc-day-bg.has-events::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 1;
        }
        .rbc-day-bg.has-events > * {
          position: relative;
          z-index: 2;
        }
        .rbc-event {
          background-color: transparent !important;
          color: inherit !important;
          border: none !important;
          box-shadow: none !important;
        }
        .dark .rbc-event {
          color: white !important;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        views={["month"]}
        onSelectSlot={handleSelectSlot}
        selectable={true}
        toolbar={true}
        className="text-xs sm:text-sm md:text-base dark:bg-gray-800 dark:text-white rbc-calendar-dark"
        messages={messages}
        formats={formats}
        culture={i18n.language}
        components={{
          toolbar: (toolbarProps) => (
            <div className="rbc-toolbar dark:bg-gray-800 dark:text-white">
              <span className="rbc-btn-group">
                <button
                  type="button"
                  onClick={() => toolbarProps.onNavigate("PREV")}
                  className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {messages.previous}
                </button>
                <button
                  type="button"
                  onClick={() => toolbarProps.onNavigate("TODAY")}
                  className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {messages.today}
                </button>
                <button
                  type="button"
                  onClick={() => toolbarProps.onNavigate("NEXT")}
                  className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {messages.next}
                </button>
              </span>
              <span className="rbc-toolbar-label dark:text-white">
                {toolbarProps.label}
              </span>
            </div>
          ),
          eventWrapper: ({ event }) => (
            <div
              style={{ height: "100%", width: "100%", position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  left: "2px",
                  right: "2px",
                  height: "4px",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${event.resource.incomePercentage}%`,
                    height: "100%",
                    backgroundColor: "rgba(0, 255, 0, 0.5)",
                    float: "left",
                  }}
                />
                <div
                  style={{
                    width: `${100 - event.resource.incomePercentage}%`,
                    height: "100%",
                    backgroundColor: "rgba(255, 0, 0, 0.5)",
                    float: "left",
                  }}
                />
              </div>
            </div>
          ),
        }}
      />

      <Modal
        title={t("calendar.modal.title", {
          date: formatModalDate(selectedDate),
        })}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        className="calendar-modal"
        width="90%"
        style={{ maxWidth: "600px" }}
      >
        {selectedTransactions.length > 0 ? (
          renderModalContent(selectedTransactions)
        ) : (
          <div className="text-center py-4 dark:text-gray-300">
            {t("calendar.modal.noTransactions")}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomCalendar;
