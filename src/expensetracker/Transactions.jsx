import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AddTransactionModal from './AddTransactionModal';
import AddTransactionButton from './AddTransactionButton';
import { Table, Tag } from 'antd';
import {
  FaGamepad, FaShoppingCart, FaUtensils, FaMoneyBill, FaBriefcase, FaCoins, FaChartLine, FaHome,
  FaHandHoldingUsd, FaPiggyBank, FaGift, FaUniversity, FaWifi, FaCar, FaStethoscope, FaPhone,
  FaChild, FaHamburger, FaFilm, FaPlane, FaDumbbell, FaHeart, FaPaw, FaWallet,
} from 'react-icons/fa';

const Transactions = () => {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Income Categories
  const incomeCategories = [
    { label: 'Salary', icon: <FaMoneyBill />, color: '#fdaa60' },
    { label: 'Freelance Income', icon: <FaBriefcase />, color: '#fdaa60' },
    { label: 'Bonus', icon: <FaCoins />, color: '#fdaa60' },
    { label: 'Investment Income', icon: <FaChartLine />, color: '#fdaa60' },
    { label: 'Rental Income', icon: <FaHome />, color: '#fdaa60' },
    { label: 'Dividends', icon: <FaHandHoldingUsd />, color: '#fdaa60' },
    { label: 'Interest Income', icon: <FaPiggyBank />, color: '#fdaa60' },
    { label: 'Gifts', icon: <FaGift />, color: '#fdaa60' },
    { label: 'Refunds', icon: <FaUniversity />, color: '#fdaa60' },
    { label: 'Other Income', icon: <FaWallet />, color: '#fdaa60' },
  ];

  // Essential Expenses
  const essentialExpenses = [
    { label: 'Rent/Mortgage', icon: <FaHome />, color: '#fdaa60' },
    { label: 'Utilities', icon: <FaWifi />, color: '#fdaa60' },
    { label: 'Groceries', icon: <FaShoppingCart />, color: '#fdaa60' },
    { label: 'Transportation', icon: <FaCar />, color: '#fdaa60' },
    { label: 'Insurance', icon: <FaStethoscope />, color: '#fdaa60' },
    { label: 'Medical Expenses', icon: <FaStethoscope />, color: '#fdaa60' },
    { label: 'Internet', icon: <FaWifi />, color: '#fdaa60' },
    { label: 'Phone Bill', icon: <FaPhone />, color: '#fdaa60' },
    { label: 'Childcare', icon: <FaChild />, color: '#fdaa60' },
    { label: 'Loan Payments', icon: <FaUniversity />, color: '#fdaa60' },
  ];

  // Lifestyle Expenses
  const lifestyleExpenses = [
    { label: 'Dining Out', icon: <FaHamburger />, color: '#fdaa60' },
    { label: 'Entertainment', icon: <FaFilm />, color: '#fdaa60' },
    { label: 'Shopping', icon: <FaShoppingCart />, color: '#fdaa60' },
    { label: 'Travel', icon: <FaPlane />, color: '#fdaa60' },
    { label: 'Gym/Fitness', icon: <FaDumbbell />, color: '#fdaa60' },
    { label: 'Subscriptions', icon: <FaFilm />, color: '#fdaa60' },
    { label: 'Gifts/Donations', icon: <FaGift />, color: '#fdaa60' },
    { label: 'Personal Care', icon: <FaHeart />, color: '#fdaa60' },
    { label: 'Pet Expenses', icon: <FaPaw />, color: '#fdaa60' },
    { label: 'Other Expenses', icon: <FaWallet />, color: '#fdaa60' },
  ];

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(transactionsData);
      };
      fetchTransactions();
    }
  }, [user]);

  const handleAddTransaction = async (transaction) => {
    if (user) {
      const newTransaction = {
        ...transaction,
        userId: user.uid,
        date: new Date(transaction.date).toISOString(),
        amount: parseFloat(transaction.amount),
      };
      const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
      setTransactions([...transactions, { id: docRef.id, ...newTransaction }]);
    }
  };

  const renderCategoryTag = (category) => {
    const categoryIcons = {
      'Salary': <FaMoneyBill className="text-white" />,
      'Freelance Income': <FaBriefcase className="text-white" />,
      'Bonus': <FaCoins className="text-white" />,
      'Investment Income': <FaChartLine className="text-white" />,
      'Rental Income': <FaHome className="text-white" />,
      'Dividends': <FaHandHoldingUsd className="text-white" />,
      'Interest Income': <FaPiggyBank className="text-white" />,
      'Gifts': <FaGift className="text-white" />,
      'Refunds': <FaUniversity className="text-white" />,
      'Other Income': <FaWallet className="text-white" />,
      'Rent/Mortgage': <FaHome className="text-white" />,
      'Utilities': <FaWifi className="text-white" />,
      'Groceries': <FaShoppingCart className="text-white" />,
      'Transportation': <FaCar className="text-white" />,
      'Insurance': <FaStethoscope className="text-white" />,
      'Medical Expenses': <FaStethoscope className="text-white" />,
      'Internet': <FaWifi className="text-white" />,
      'Phone Bill': <FaPhone className="text-white" />,
      'Childcare': <FaChild className="text-white" />,
      'Loan Payments': <FaUniversity className="text-white" />,
      'Dining Out': <FaHamburger className="text-white" />,
      'Entertainment': <FaFilm className="text-white" />,
      'Shopping': <FaShoppingCart className="text-white" />,
      'Travel': <FaPlane className="text-white" />,
      'Gym/Fitness': <FaDumbbell className="text-white" />,
      'Subscriptions': <FaFilm className="text-white" />,
      'Gifts/Donations': <FaGift className="text-white" />,
      'Personal Care': <FaHeart className="text-white" />,
      'Pet Expenses': <FaPaw className="text-white" />,
      'Other Expenses': <FaWallet className="text-white" />,
    };

    const icon = categoryIcons[category] || null;

    return (
      <Tag color="#fdaa60" className="flex items-center gap-2 w-max rounded-full px-2 py-1">
        {icon}
        <span className="text-sm font-inter font-normal text-[#f5f7fa]">
          {category}
        </span>
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        {
          text: 'Income',
          value: 'Income',
          children: incomeCategories.map((cat) => ({ text: cat.label, value: cat.label })),
        },
        {
          text: 'Essential Expenses',
          value: 'Essential Expenses',
          children: essentialExpenses.map((cat) => ({ text: cat.label, value: cat.label })),
        },
        {
          text: 'Lifestyle Expenses',
          value: 'Lifestyle Expenses',
          children: lifestyleExpenses.map((cat) => ({ text: cat.label, value: cat.label })),
        },
      ],
      onFilter: (value, record) => {
        if (value === 'Income') {
          return incomeCategories.some((cat) => cat.label === record.category);
        } else if (value === 'Essential Expenses') {
          return essentialExpenses.some((cat) => cat.label === record.category);
        } else if (value === 'Lifestyle Expenses') {
          return lifestyleExpenses.some((cat) => cat.label === record.category);
        }
        return record.category.includes(value);
      },
      render: (category) => renderCategoryTag(category),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Expense', value: 'Expense' },
        { text: 'Income', value: 'Income' },
      ],
      onFilter: (value, record) => record.type.includes(value),
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      sorter: (a, b) => a.provider.localeCompare(b.provider),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      filters: [
        { text: 'Wallet', value: 'Wallet' },
        { text: 'Card', value: 'Card' },
      ],
      onFilter: (value, record) => record.paymentMethod.includes(value),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
  ];

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Recent Transactions</h1>
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #d5d7da',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      />
      <div className="mt-4">
        <AddTransactionButton onClick={() => setIsModalOpen(true)} />
      </div>
      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default Transactions;