import { Modal, Input, DatePicker, Button, Form } from "antd"
import { useTranslation } from "react-i18next"

const AddSavingsGoalModal = ({ open, onClose, onSave }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({
        goalName: values.goalName,
        goalAmount: Number.parseFloat(values.goalAmount),
        deadline: values.deadline ? values.deadline.toISOString() : null,
        createdAt: new Date().toISOString(),
        currentAmount: 0,
      })
      form.resetFields()
      onClose()
    })
  }

  return (
    <Modal
      title={t("savingsGoals.modals.addGoal.title")}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("savingsGoals.modals.addGoal.cancel")}
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {t("savingsGoals.modals.addGoal.save")}
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
          name="goalName"
          label={t("savingsGoals.modals.addGoal.goalName")}
          rules={[{ required: true, message: "Please enter goal name" }]}
        >
          <Input
            placeholder={t("savingsGoals.modals.addGoal.goalNamePlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="goalAmount"
          label={t("savingsGoals.modals.addGoal.targetAmount")}
          rules={[
            { required: true, message: "Please enter target amount" },
            { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
          ]}
        >
          <Input placeholder="0.00" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </Form.Item>

        <Form.Item name="deadline" label={t("savingsGoals.modals.addGoal.deadline")}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder={t("savingsGoals.modals.addGoal.deadlinePlaceholder")}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddSavingsGoalModal;

