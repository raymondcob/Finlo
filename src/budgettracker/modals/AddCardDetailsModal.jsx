"use client"

import { useState } from "react"
import { Modal, Input, Button, Form } from "antd"

const AddCardDetailsModal = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm()
  const [error, setError] = useState("")

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const details = {
          cardHolder: values.cardHolder,
          validThru: values.validThru,
          cardNumber: values.cardNumber,
          balance: Number.parseFloat(values.balance).toFixed(2),
        }
        onSave(details)
        form.resetFields()
        onClose()
      })
      .catch((info) => {
        setError("Please fill all required fields correctly")
      })
  }

  return (
    <Modal
      title="Add Card Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
      className="dark:bg-gray-800 dark:text-white"
      styles={{
        header: {
          background: "var(--finance-blue-50)",
        },
        body: {
          padding: "20px",
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="cardHolder"
          label="Card Holder"
          rules={[{ required: true, message: "Please enter card holder name" }]}
        >
          <Input
            placeholder="Enter card holder name"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="validThru"
          label="Valid Thru"
          rules={[{ required: true, message: "Please enter expiration date" }]}
        >
          <Input placeholder="MM/YY" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </Form.Item>

        <Form.Item
          name="cardNumber"
          label="Card Number"
          rules={[{ required: true, message: "Please enter card number" }]}
        >
          <Input placeholder="**** **** **** ****" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </Form.Item>

        <Form.Item
          name="balance"
          label="Initial Balance"
          rules={[
            { required: true, message: "Please enter initial balance" },
            { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
          ]}
        >
          <Input placeholder="0.00" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </Form.Item>
      </Form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <p className="text-red-500 text-sm mt-4">
        Note: You can only set the initial balance once. It will be updated through transactions.
      </p>
    </Modal>
  )
}

export default AddCardDetailsModal

