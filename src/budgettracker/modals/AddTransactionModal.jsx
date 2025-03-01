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

const { Option } = Select

const AddTransactionModal = ({ open, onClose, onAddTransaction, cardBalance, walletBalance }) => {
  const [form] = Form.useForm()

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
    { group: "Income", items: incomeCategories },
    { group: "Essential Expenses", items: essentialExpenses },
    { group: "Lifestyle Expenses", items: lifestyleExpenses },
  ]

  // Custom option render for dropdown items
  const optionRender = (item) => {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color }}>
          {item.icon}
        </div>
        <span className="text-sm">{item.label}</span>
      </div>
    )
  }

  const handleSubmit = (values) => {
    onAddTransaction({
      category: values.category,
      type: values.type,
      provider: values.provider,
      paymentMethod: values.paymentMethod,
      date: values.date.toISOString(),
      amount: Number.parseFloat(values.amount),
    })
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
          <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Add Transaction</span>
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
            label={<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Category</span>}
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select className="w-full h-12" optionLabelProp="label" dropdownStyle={{ maxHeight: 400 }}>
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
            label={<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Type</span>}
            rules={[{ required: true, message: "Type is required" }]}
          >
            <Select className="w-full h-12 text-lg">
              <Option value="Income" className="text-lg">
                Income
              </Option>
              <Option value="Expense" className="text-lg">
                Expense
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label={<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Payment Method</span>}
            rules={[{ required: true, message: "Payment Method is required" }]}
          >
            <Select className="w-full h-12 text-lg">
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
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Form.Item
            name="date"
            label={<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Date</span>}
            rules={[{ required: true, message: "Date is required" }]}
          >
            <DatePicker className="w-full h-12 text-lg" />
          </Form.Item>

          <Form.Item
            name="provider"
            label={<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Provider</span>}
            rules={[{ required: true, message: "Provider is required" }]}
          >
            <Input placeholder="Enter Provider" className="w-full h-12 text-lg px-4" />
          </Form.Item>

          <Form.Item
            name="amount"
            label={<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Amount</span>}
            rules={[
              { required: true, message: "Amount is required" },
              { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
            ]}
          >
            <Input prefix="$" placeholder="0.00" className="w-full h-12 text-lg px-4" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-lg dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-finance-blue-600 text-white hover:bg-finance-blue-700 transition-colors duration-200 text-lg"
          >
            Add
          </button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddTransactionModal

