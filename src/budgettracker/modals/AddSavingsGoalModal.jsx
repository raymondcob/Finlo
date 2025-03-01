import { Modal, Input, DatePicker, Button, Form } from "antd"

const AddSavingsGoalModal = ({ open, onClose, onSave }) => {
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
      title="Add Savings Goal"
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
        <Form.Item name="goalName" label="Goal Name" rules={[{ required: true, message: "Please enter goal name" }]}>
          <Input
            placeholder="e.g. New Car, Vacation, Emergency Fund"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>

        <Form.Item
          name="goalAmount"
          label="Target Amount"
          rules={[
            { required: true, message: "Please enter target amount" },
            { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
          ]}
        >
          <Input placeholder="0.00" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </Form.Item>

        <Form.Item name="deadline" label="Deadline (Optional)">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select target date"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddSavingsGoalModal

