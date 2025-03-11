import {
  FaWallet,
  FaCreditCard,
  FaShoppingCart,
  FaMoneyBill,
  FaPiggyBank,
  FaHome,
  FaCar,
  FaBriefcase,
  FaPlane,
  FaGift,
  FaHeart,
  FaDumbbell,
  FaFilm,
  FaHamburger,
  FaWifi,
  FaPhone,
  FaChild,
  FaPaw,
  FaStethoscope,
  FaUniversity,
  FaCoins,
  FaChartLine,
  FaHandHoldingUsd,
} from "react-icons/fa"
import { DatePicker, Select, Input, Form, Modal } from "antd"
import moment from "moment"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const { Option } = Select

const AddTransactionModal = ({ open, onClose, onAddTransaction, cardBalance, walletBalance }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [selectedType, setSelectedType] = useState("Income")

  // Income Categories with Icons
  const incomeCategories = [
    { label: "Salary", icon: <FaMoneyBill />, color: "#fdaa60" },
    { label: "Freelance Income", icon: <FaBriefcase />, color: "#fdaa60" },
    { label: "Bonus", icon: <FaCoins />, color: "#fdaa60" },
    { label: "Investment Income", icon: <FaChartLine />, color: "#fdaa60" },
    { label: "Rental Income", icon: <FaHome />, color: "#fdaa60" },
    { label: "Dividends", icon: <FaHandHoldingUsd />, color: "#fdaa60" },
    { label: "Interest Income", icon: <FaPiggyBank />, color: "#fdaa60" },
    { label: "Gifts", icon: <FaGift />, color: "#fdaa60" },
    { label: "Refunds", icon: <FaUniversity />, color: "#fdaa60" },
    { label: "Other Income", icon: <FaWallet />, color: "#fdaa60" },
  ]

  // Essential Expenses with Icons
  const essentialExpenses = [
    { label: "Rent/Mortgage", icon: <FaHome />, color: "#fdaa60" },
    { label: "Utilities", icon: <FaWifi />, color: "#fdaa60" },
    { label: "Groceries", icon: <FaShoppingCart />, color: "#fdaa60" },
    { label: "Transportation", icon: <FaCar />, color: "#fdaa60" },
    { label: "Insurance", icon: <FaStethoscope />, color: "#fdaa60" },
    { label: "Medical Expenses", icon: <FaStethoscope />, color: "#fdaa60" },
    { label: "Internet", icon: <FaWifi />, color: "#fdaa60" },
    { label: "Phone Bill", icon: <FaPhone />, color: "#fdaa60" },
    { label: "Childcare", icon: <FaChild />, color: "#fdaa60" },
    { label: "Loan Payments", icon: <FaUniversity />, color: "#fdaa60" },
  ]

  // Lifestyle Expenses with Icons
  const lifestyleExpenses = [
    { label: "Dining Out", icon: <FaHamburger />, color: "#fdaa60" },
    { label: "Entertainment", icon: <FaFilm />, color: "#fdaa60" },
    { label: "Shopping", icon: <FaShoppingCart />, color: "#fdaa60" },
    { label: "Travel", icon: <FaPlane />, color: "#fdaa60" },
    { label: "Gym/Fitness", icon: <FaDumbbell />, color: "#fdaa60" },
    { label: "Subscriptions", icon: <FaFilm />, color: "#fdaa60" },
    { label: "Gifts/Donations", icon: <FaGift />, color: "#fdaa60" },
    { label: "Personal Care", icon: <FaHeart />, color: "#fdaa60" },
    { label: "Pet Expenses", icon: <FaPaw />, color: "#fdaa60" },
    { label: "Other Expenses", icon: <FaWallet />, color: "#fdaa60" },
  ]

  // Combine all categories
  const allCategories = [
    { group: t("transactions.categories.income.title"), items: incomeCategories },
    { group: t("transactions.categories.essential.title"), items: essentialExpenses },
    { group: t("transactions.categories.lifestyle.title"), items: lifestyleExpenses },
  ]

  // Custom option render for dropdown items
  const optionRender = (item) => {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color }}>
          {item.icon}
        </div>
        <span className="text-sm">
          {t(`transactions.categories.${getCategoryType(item.label)}.${item.label.toLowerCase().replace(/\s+/g, "")}`)}
        </span>
      </div>
    )
  }

  // Helper function to get category type
  const getCategoryType = (category) => {
    if (incomeCategories.some((cat) => cat.label === category)) return "income"
    if (essentialExpenses.some((cat) => cat.label === category)) return "essential"
    if (lifestyleExpenses.some((cat) => cat.label === category)) return "lifestyle"
    return ""
  }

  // Watch for category changes to auto-update type
  const handleCategoryChange = (value) => {
    const isIncomeCategory = incomeCategories.some((cat) => cat.label === value)
    const isExpenseCategory = [...essentialExpenses, ...lifestyleExpenses].some((cat) => cat.label === value)

    if (isIncomeCategory && selectedType !== "Income") {
      form.setFieldsValue({ type: "Income" })
      setSelectedType("Income")
    } else if (isExpenseCategory && selectedType !== "Expense") {
      form.setFieldsValue({ type: "Expense" })
      setSelectedType("Expense")
    }
  }

  // Validate balances before submission
  const handleSubmit = (values) => {
    if (!cardBalance && !walletBalance) {
      Modal.error({
        title: t("modals.addTransaction.errors.noBalance.title"),
        content: t("modals.addTransaction.errors.noBalance.content"),
      })
      return
    }

    // Validate category and type match
    const isIncomeCategory = incomeCategories.some((cat) => cat.label === values.category)
    const isExpenseCategory = [...essentialExpenses, ...lifestyleExpenses].some((cat) => cat.label === values.category)

    if (values.type === "Income" && !isIncomeCategory) {
      Modal.error({
        title: t("modals.addTransaction.errors.categoryMismatch.title"),
        content: t("modals.addTransaction.errors.categoryMismatch.incomeContent"),
      })
      return
    }

    if (values.type === "Expense" && !isExpenseCategory) {
      Modal.error({
        title: t("modals.addTransaction.errors.categoryMismatch.title"),
        content: t("modals.addTransaction.errors.categoryMismatch.expenseContent"),
      })
      return
    }

    // Get local date components
    const dateValue = values.date.toDate()
    const localDate = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate(),
      12, // Set to noon to avoid timezone issues
      0,
      0,
      0,
    )

    const transactionData = {
      ...values,
      date: localDate,
      amount: Number.parseFloat(values.amount),
    }

    onAddTransaction(transactionData)
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <img
            src="https://dashboard.codeparrot.ai/api/image/Z5v_EYIayXWIU-PY/receipt.png"
            alt="Receipt Icon"
            className="w-10 h-10"
          />
          <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            {t("modals.addTransaction.title")}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      className="add-transaction-modal"
      styles={{
        mask: {
          backdropFilter: "blur(5px)",
          background: "rgba(0, 0, 0, 0.2)",
        },
        content: {
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          category: "Salary",
          type: "Income",
          paymentMethod: "Wallet",
          date: moment(),
        }}
        onFinish={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Form.Item
            name="category"
            label={
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("modals.addTransaction.category")}
              </span>
            }
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select
              className="w-full h-12"
              optionLabelProp="label"
              dropdownStyle={{ maxHeight: 400 }}
              onChange={handleCategoryChange}
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
          </Form.Item>

          <Form.Item
            name="type"
            label={
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("modals.addTransaction.type")}
              </span>
            }
            rules={[{ required: true, message: "Type is required" }]}
          >
            <Select className="w-full h-12 text-lg" onChange={(value) => setSelectedType(value)}>
              <Option value="Income" className="text-lg">
                {t("transactions.type.income")}
              </Option>
              <Option value="Expense" className="text-lg">
                {t("transactions.type.expense")}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label={
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("modals.addTransaction.paymentMethod")}
              </span>
            }
            rules={[{ required: true, message: "Payment Method is required" }]}
          >
            <Select className="w-full h-12 text-lg">
              {walletBalance > 0 && (
                <Option value="Wallet" className="text-lg">
                  <div className="flex items-center gap-2">
                    <FaWallet />
                    {t("modals.addTransaction.walletBalance", { balance: walletBalance })}
                  </div>
                </Option>
              )}
              {cardBalance > 0 && (
                <Option value="Card" className="text-lg">
                  <div className="flex items-center gap-2">
                    <FaCreditCard />
                    {t("modals.addTransaction.cardBalance", { balance: cardBalance })}
                  </div>
                </Option>
              )}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Form.Item
            name="date"
            label={
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("modals.addTransaction.date")}
              </span>
            }
            rules={[{ required: true, message: "Date is required" }]}
          >
            <DatePicker className="w-full h-12 text-lg" />
          </Form.Item>

          <Form.Item
            name="provider"
            label={
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("modals.addTransaction.provider")}
              </span>
            }
            rules={[{ required: true, message: "Provider is required" }]}
          >
            <Input placeholder={t("modals.addTransaction.providerPlaceholder")} className="w-full h-12 text-lg px-4" />
          </Form.Item>

          <Form.Item
            name="amount"
            label={
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("modals.addTransaction.amount")}
              </span>
            }
            rules={[
              { required: true, message: "Amount is required" },
              {
                pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Please enter a valid amount",
              },
            ]}
          >
            <Input
              prefix="$"
              placeholder={t("modals.addTransaction.amountPlaceholder")}
              className="w-full h-12 text-lg px-4"
            />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-lg dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t("modals.addTransaction.cancel")}
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-finance-blue-600 text-white hover:bg-finance-blue-700 transition-colors duration-200 text-lg"
          >
            {t("modals.addTransaction.save")}
          </button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddTransactionModal;

