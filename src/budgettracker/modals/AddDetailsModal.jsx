"use client"

import { useState } from "react"
import { Modal, Input, Button, Form } from "antd"
import { useTranslation } from "react-i18next"

const AddDetailsModal = ({ open, onClose, onSave }) => {
  const { t } = useTranslation()
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
      title={t("incomesources.modals.addWallet.title")}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("common.cancel")}
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {t("common.save")}
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
          label={t("incomesources.modals.addWallet.balance")}
          rules={[
            { required: true, message: "Please enter initial balance" },
            { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
          ]}
        >
          <Input
            placeholder={t("incomesources.modals.addWallet.balancePlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>
      </Form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <p className="text-red-500 text-sm mt-4">{t("incomesources.modals.addWallet.balanceSetWarning")}</p>
    </Modal>
  )
}

export default AddDetailsModal;

