"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Button, Form } from "antd";
import { useTranslation } from "react-i18next";

const AddCardDetailsModal = ({
  open,
  onClose,
  onSave,
  isBalanceSet,
  cardDetails,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && cardDetails) {
      form.setFieldsValue({
        cardHolder: cardDetails.cardHolder,
        validThru: cardDetails.validThru,
        cardNumber: cardDetails.cardNumber,
        balance: cardDetails.balance,
      });
    }
  }, [open, cardDetails, form]);

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
        };
        onSave(details);
        form.resetFields();
        onClose();
      })
      .catch((info) => {
        setError("Please fill all required fields correctly");
      });
  };

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
    >
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          {t(
            "incomesources.modals.addCard.securityNotice",
            "This is a mock card for demonstration purposes only. Do not enter real card information. All data is simulated for the app experience."
          )}
        </p>
      </div>

      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="cardHolder"
          label={t("incomesources.modals.addCard.cardHolder")}
          rules={[{ required: true, message: "Please enter card holder name" }]}
        >
          <Input
            placeholder={t(
              "incomesources.modals.addCard.cardHolderPlaceholder"
            )}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="validThru"
          label={t("incomesources.modals.addCard.validThru")}
          rules={[
            { required: true, message: "Please enter expiration date" },
            {
              pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
              message: "Please use MM/YY format",
            },
          ]}
          help={t("incomesources.modals.addCard.validThruFormat")}
        >
          <Input
            placeholder="MM/YY"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            maxLength={5}
            onChange={(e) => {
              let value = e.target.value.replace(/[^\d]/g, "");
              if (value.length >= 2) {
                value = value.slice(0, 2) + "/" + value.slice(2);
              }
              form.setFieldsValue({ validThru: value });
            }}
          />
        </Form.Item>

        <Form.Item
          name="cardNumber"
          label={t("incomesources.modals.addCard.cardNumber")}
          rules={[
            {
              required: true,
              message: t("incomesources.modals.addCard.cardNumberHelp"),
            },
            {
              pattern: /^\d{4}$/,
              message: t("incomesources.modals.addCard.cardNumberFormat"),
            },
          ]}
          help={t("incomesources.modals.addCard.cardNumberHelp")}
        >
          <Input
            placeholder={t(
              "incomesources.modals.addCard.cardNumberPlaceholder"
            )}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            maxLength={4}
            addonBefore={t("incomesources.modals.addCard.cardNumberPrefix")}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, "");
              form.setFieldsValue({ cardNumber: value });
            }}
          />
        </Form.Item>

        <Form.Item
          name="balance"
          label={t("incomesources.modals.addCard.initialBalance")}
          rules={[
            {
              required: !isBalanceSet,
              message: "Please enter initial balance",
            },
            {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "Please enter a valid amount",
            },
          ]}
        >
          <Input
            placeholder={t(
              "incomesources.modals.addCard.initialBalancePlaceholder"
            )}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isBalanceSet} // Disable input if balance is already set
          />
        </Form.Item>
      </Form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {isBalanceSet && (
        <p className="text-red-500 text-sm mt-4">
          {t("incomesources.modals.addCard.balanceSetWarning")}
        </p>
      )}
    </Modal>
  );
};

export default AddCardDetailsModal;
