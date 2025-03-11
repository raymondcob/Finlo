"use client"

import { useState, useEffect } from "react"
import { Modal, Input, Button, Form } from "antd"
import { useTranslation } from "react-i18next"

const AddCardDetailsModal = ({ open, onClose, onSave, isBalanceSet, cardDetails }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && cardDetails) {
      form.setFieldsValue({
        cardHolder: cardDetails.cardHolder,
        validThru: cardDetails.validThru,
        cardNumber: cardDetails.cardNumber,
        balance: cardDetails.balance,
      })
    }
  }, [open, cardDetails, form])

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const details = {
          cardHolder: values.cardHolder,
          validThru: values.validThru,
          cardNumber: values.cardNumber,
          balance: isBalanceSet
            ? cardDetails.balance // If balance is already set, use the existing balance
            : Number.parseFloat(values.balance).toFixed(2),
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
      title={t("incomesources.modals.addCard.title")}
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
          label={t("incomesources.modals.addCard.cardHolder")}
          rules={[{ required: true, message: "Please enter card holder name" }]}
        >
          <Input
            placeholder={t("incomesources.modals.addCard.cardHolderPlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="validThru"
          label={t("incomesources.modals.addCard.validThru")}
          rules={[{ required: true, message: "Please enter expiration date" }]}
        >
          <Input
            placeholder={t("incomesources.modals.addCard.validThruPlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="cardNumber"
          label={t("incomesources.modals.addCard.cardNumber")}
          rules={[{ required: true, message: "Please enter card number" }]}
        >
          <Input
            placeholder={t("incomesources.modals.addCard.cardNumberPlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="balance"
          label={t("incomesources.modals.addCard.initialBalance")}
          rules={[
            { required: !isBalanceSet, message: "Please enter initial balance" },
            { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
          ]}
        >
          <Input
            placeholder={t("incomesources.modals.addCard.initialBalancePlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isBalanceSet} // Disable input if balance is already set
          />
        </Form.Item>
      </Form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {isBalanceSet && (
        <p className="text-red-500 text-sm mt-4">{t("incomesources.modals.addCard.balanceSetWarning")}</p>
      )}
    </Modal>
  )
}

export default AddCardDetailsModal;

