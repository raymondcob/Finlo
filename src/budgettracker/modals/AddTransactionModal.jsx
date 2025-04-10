import { FaWallet, FaCreditCard } from "react-icons/fa"
import { DatePicker, Select, Input, Form, Modal, Button } from "antd"
import moment from "moment"
import { useState, useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../context/UserContext"
import { categoryIcons } from "../Transactions"

const { Option } = Select

const AddTransactionModal = ({ open, onClose, onAddTransaction, cardBalance, walletBalance }) => {
  const { t } = useTranslation()
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [selectedType, setSelectedType] = useState("Income")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false) // Add a state for submission status

  // Add check for payment methods
  useEffect(() => {
    if (open && cardBalance === 0 && walletBalance === 0) {
      // Close modal
      onClose()
      // Show error toast with the correct translation key
      toast.error(t("transactions.error.noPaymentMethodsMessage"), {
        duration: 5000,
        action: {
          label: t("transactions.error.setupSources"),
          onClick: () => navigate("/income"),
        },
      })
    }
  }, [open, cardBalance, walletBalance, navigate, t, onClose])

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (open) {
      form.resetFields()
      setError("")
      form.setFieldsValue({
        category: "salary",
        type: "Income",
        paymentMethod: "Wallet",
        date: moment(),
      })
    }
  }, [open, form])

  // Define category options
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
  ]

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
  ]

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
  ]

  // Get categories based on selected type
  const getCategoryOptions = () => {
    switch (selectedType) {
      case "Income":
        return incomeCategories
      case "Expense":
        return [
          {
            label: t("transactions.categories.essential.title"),
            options: essentialExpenses,
          },
          {
            label: t("transactions.categories.lifestyle.title"),
            options: lifestyleExpenses,
          },
        ]
      default:
        return []
    }
  }

  // Custom option render for dropdown items
  const optionRender = (item) => {
    const IconComponent = categoryIcons[item.value] || FaWallet

    return (
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#0c8de0" }} // Finance-themed blue color
        >
          <IconComponent className="text-white text-lg" />
        </div>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
      </div>
    )
  }

  // Watch for category changes to auto-update type
  const handleCategoryChange = (value) => {
    const isIncomeCategory = incomeCategories.some((cat) => cat.value === value)
    const isExpenseCategory = [...essentialExpenses, ...lifestyleExpenses].some((cat) => cat.value === value)

    if (isIncomeCategory && selectedType !== "Income") {
      form.setFieldsValue({ type: "Income" })
      setSelectedType("Income")
    } else if (isExpenseCategory && selectedType !== "Expense") {
      form.setFieldsValue({ type: "Expense" })
      setSelectedType("Expense")
    }
  }

  const handleTypeChange = (value) => {
    setSelectedType(value)
    // Automatically set the category based on the selected type
    const defaultCategory = value === "Income" ? "salary" : "rent/mortgage"
    form.setFieldsValue({ category: defaultCategory })
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setError("")
      setIsSubmitting(true) // Set submitting state to true
      const { type, category, amount, provider, paymentMethod, date } = values

      // Validation for payment method balances
      if (type.toLowerCase() === "expense") {
        const balance = paymentMethod === "Wallet" ? walletBalance : cardBalance
        if (Number(amount) > balance) {
          setError(
            t("transactions.error.insufficientBalanceMessage", {
              method: paymentMethod.toLowerCase(),
            })
          )
          setIsSubmitting(false) // Reset submitting state
          return
        }
      }

      // Create transaction object with proper fields
      const transaction = {
        type,
        category,
        amount: Number(amount),
        provider: provider.trim(),
        paymentMethod,
        date: date.toDate(),
        userId: user.uid,
      }

      await onAddTransaction(transaction)
      toast.success(t("transactions.success.addedMessage"))
      form.resetFields()
      onClose()
    } catch (error) {
      console.error("Error adding transaction:", error)
      setError(t("transactions.error.addingTransactionMessage"))
    } finally {
      setIsSubmitting(false) // Reset submitting state
    }
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
            {cardBalance === 0 && walletBalance === 0
              ? t("modals.addTransaction.setupRequired")
              : t("modals.addTransaction.title")}
          </span>
        </div>
      }
      open={open && (cardBalance > 0 || walletBalance > 0)} // Only show if payment methods exist
      onCancel={() => {
        form.resetFields()
        setError("")
        onClose()
      }}
      afterClose={() => {
        form.resetFields()
        setError("")
      }}
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
      {cardBalance === 0 && walletBalance === 0 ? (
        <div className="text-center py-8">
          <FaWallet className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t("transactions.error.noPaymentMethodsMessage")}</p>
          <Button type="primary" onClick={() => navigate("/income")} className="bg-finance-blue-600">
            {t("transactions.error.setupSources")}
          </Button>
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              name="category"
              label={
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  {t("modals.addTransaction.category")}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: t("modals.addTransaction.categoryRequired"),
                },
              ]}
            >
              <Select
                className="w-full h-12"
                optionLabelProp="label"
                dropdownStyle={{ maxHeight: 400 }}
                onChange={handleCategoryChange}
                dropdownClassName="dark:bg-gray-800 dark:text-white"
              >
                {getCategoryOptions().map((group) => {
                  if (group.options) {
                    return (
                      <Select.OptGroup key={group.label} label={group.label}>
                        {group.options.map((cat) => (
                          <Option key={cat.value} value={cat.value} label={cat.label}>
                            {optionRender(cat)}
                          </Option>
                        ))}
                      </Select.OptGroup>
                    )
                  } else {
                    return (
                      <Option key={group.value} value={group.value} label={group.label}>
                        {optionRender(group)}
                      </Option>
                    )
                  }
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="type"
              label={
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  {t("modals.addTransaction.type")}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: t("modals.addTransaction.typeRequired"),
                },
              ]}
            >
              <Select
                className="w-full h-12 text-lg"
                onChange={handleTypeChange} // Use the updated handler
                dropdownClassName="dark:bg-gray-800 dark:text-white"
              >
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
              rules={[
                {
                  required: true,
                  message: t("modals.addTransaction.paymentMethodRequired"),
                },
              ]}
            >
              <Select className="w-full h-12 text-lg" dropdownClassName="dark:bg-gray-800 dark:text-white">
                {walletBalance > 0 && (
                  <Option value="Wallet" className="text-lg">
                    <div className="flex items-center gap-2">
                      <FaWallet />
                      {t("modals.addTransaction.walletBalance", {
                        balance: walletBalance,
                      })}
                    </div>
                  </Option>
                )}
                {cardBalance > 0 && (
                  <Option value="Card" className="text-lg">
                    <div className="flex items-center gap-2">
                      <FaCreditCard />
                      {t("modals.addTransaction.cardBalance", {
                        balance: cardBalance,
                      })}
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
              rules={[
                {
                  required: true,
                  message: t("modals.addTransaction.dateRequired"),
                },
              ]}
            >
              <DatePicker className="w-full h-12 text-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </Form.Item>

            <Form.Item
              name="provider"
              label={
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  {t("modals.addTransaction.provider")}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: t("modals.addTransaction.providerRequired"),
                },
              ]}
            >
              <Input
                placeholder={t("modals.addTransaction.providerPlaceholder")}
                className="w-full h-12 text-lg px-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </Form.Item>

            <Form.Item
              name="amount"
              label={
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  {t("modals.addTransaction.amount")}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: t("modals.addTransaction.amountRequired"),
                },
                {
                  pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: t("modals.addTransaction.amountInvalid"),
                },
              ]}
            >
              <Input
                prefix="$"
                placeholder={t("modals.addTransaction.amountPlaceholder")}
                className="w-full h-12 text-lg px-4 dark:bg-gray-700 dark:text-white dark:border-gray-600" // Added dark mode styles
              />
            </Form.Item>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
              className={`px-6 py-2 rounded-lg bg-finance-blue-600 text-white hover:bg-finance-blue-700 transition-colors duration-200 text-lg ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting} // Disable button while submitting
            >
              {t("modals.addTransaction.save")}
            </button>
          </div>
        </Form>
      )}
    </Modal>
  )
}

export default AddTransactionModal

