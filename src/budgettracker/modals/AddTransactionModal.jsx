import React, { useState } from 'react';
import { FaWallet, FaCreditCard, FaShoppingCart,FaMoneyBill, FaPiggyBank, FaHome, FaCar, FaBriefcase, FaPlane, FaGift, FaHeart, FaDumbbell, FaFilm, FaHamburger, FaWifi, FaPhone, FaChild, FaPaw, FaStethoscope, FaUniversity, FaCoins, FaChartLine, FaHandHoldingUsd } from 'react-icons/fa';
import { DatePicker, Select, Input } from 'antd';
import moment from 'moment';

const { Option } = Select;

const AddTransactionModal = ({ onClose, onAddTransaction, cardBalance, walletBalance }) => {
  const [category, setCategory] = useState('Salary');
  const [type, setType] = useState('Income');
  const [provider, setProvider] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet');
  const [date, setDate] = useState(moment());
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});

  // Income Categories with Icons
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

  // Essential Expenses with Icons
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

  // Lifestyle Expenses with Icons
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

  // Combine all categories
  const allCategories = [
    { group: 'Income', items: incomeCategories },
    { group: 'Essential Expenses', items: essentialExpenses },
    { group: 'Lifestyle Expenses', items: lifestyleExpenses },
  ];

  // Custom option render for dropdown items
  const optionRender = (item) => {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color }}>
          {item.icon}
        </div>
        <span className="text-sm">{item.label}</span>
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    if (!category) newErrors.category = 'Category is required';
    if (!type) newErrors.type = 'Type is required';
    if (!provider) newErrors.provider = 'Provider is required';
    if (!paymentMethod) newErrors.paymentMethod = 'Payment Method is required';
    if (!date) newErrors.date = 'Date is required';
    if (!amount) newErrors.amount = 'Amount is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If all fields are valid, proceed
    onAddTransaction({ category, type, provider, paymentMethod, date: date.toISOString(), amount });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white rounded-xl p-8 w-[900px] max-w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src="https://dashboard.codeparrot.ai/api/image/Z5v_EYIayXWIU-PY/receipt.png"
            alt="Receipt Icon"
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-semibold text-gray-500">Add Transaction</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category */}
            <div>
              <label className="block text-lg font-medium text-gray-500 mb-3">Category</label>
              <Select
                value={category}
                onChange={(value) => setCategory(value)}
                className="w-full h-12"
                optionLabelProp="label"
              >
                {allCategories.map((group) => (
                  <Select.OptGroup key={group.group} label={group.group}>
                    {group.items.map((cat) => (
                      <Option key={cat.label} value={cat.label} label={cat.label}>
                        {optionRender(cat)}
                      </Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-lg font-medium text-gray-500 mb-3">Type</label>
              <Select
                value={type}
                onChange={(value) => setType(value)}
                className="w-full h-12 text-lg"
              >
                <Option value="Income" className="text-lg">Income</Option>
                <Option value="Expense" className="text-lg">Expense</Option>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-lg font-medium text-gray-500 mb-3">Payment Method</label>
              <Select
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value)}
                className="w-full h-12 text-lg"
              >
                <Option value="Wallet" className="text-lg">
                  <div className="flex items-center gap-2">
                    <FaWallet />
                    Wallet (Balance: ${walletBalance})
                  </div>
                </Option>
                <Option value="Card" className="text-lg">
                  <div className="flex items-center gap-2">
                    <FaCreditCard />
                    Card (Balance: ${cardBalance})
                  </div>
                </Option>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Date */}
            <div>
              <label className="block text-lg font-medium text-gray-500 mb-3">Date</label>
              <DatePicker
                value={date}
                onChange={(value) => setDate(value)}
                className="w-full h-12 text-lg"
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Provider */}
            <div>
              <label className="block text-lg font-medium text-gray-500 mb-3">Provider</label>
              <Input
                type="text"
                placeholder="Enter Provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full h-12 text-lg px-4"
              />
              {errors.provider && (
                <p className="text-sm text-red-500 mt-1">{errors.provider}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-lg font-medium text-gray-500 mb-3">Amount</label>
              <div className="flex items-center border rounded-lg px-4 h-12">
                <span className="text-lg text-gray-500">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border-none outline-none text-lg"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-lg"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;