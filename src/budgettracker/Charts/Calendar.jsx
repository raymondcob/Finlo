import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import "react-calendar/dist/Calendar.css";

const CustomCalendar = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyTransactions, setDailyTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const transactionsData = querySnapshot.docs.map((doc) => doc.data());
      setTransactions(transactionsData);
    };

    fetchTransactions();
  }, [userId]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dailyTrans = transactions.filter(
      (transaction) =>
        new Date(transaction.date).toDateString() === date.toDateString()
    );
    setDailyTransactions(dailyTrans);
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dailyTrans = transactions.filter(
        (transaction) =>
          new Date(transaction.date).toDateString() === date.toDateString()
      );
      const income = dailyTrans
        .filter((t) => t.type === "Income")
        .reduce((acc, t) => acc + t.amount, 0);
      const expense = dailyTrans
        .filter((t) => t.type === "Expense")
        .reduce((acc, t) => acc + t.amount, 0);

      return (
        <div>
          {income > 0 && (
            <div
              style={{
                backgroundColor: "green",
                width: `${income}px`,
                height: "5px",
              }}
            ></div>
          )}
          {expense > 0 && (
            <div
              style={{
                backgroundColor: "red",
                width: `${expense}px`,
                height: "5px",
              }}
            ></div>
          )}
        </div>
      );
    }
  };

  return (
    <div>
      <Calendar onClickDay={handleDateClick} tileContent={tileContent} />
      {selectedDate && (
        <div>
          <h3>Transactions on {selectedDate.toDateString()}</h3>
          <ul>
            {dailyTransactions.map((transaction, index) => (
              <li key={index}>
                {transaction.category}: ${transaction.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
