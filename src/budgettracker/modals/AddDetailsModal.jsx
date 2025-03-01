"use client"

import { useState } from "react"
import { Modal, Input, Button, Form } from "antd"

const AddDetailsModal = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm()
  const [error, setError] = useState("")

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const details = {
          balance: Number.parseFloat(values.balance).toFixed(2),
        }
        onSave(details)
        form.resetFields()
        onClose()
      })
      .catch((info) => {
        setError("Please enter a valid balance")
      })
  }

  return (
    <Modal
      title="Add Wallet Details"
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
          background: "var(--finance-green-50)",
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
          name="balance"
          label="Balance"
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

export default AddDetailsModal

