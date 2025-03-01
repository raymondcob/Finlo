import { Modal, Input, Select, Button, Form, Empty, Progress } from "antd"

const { Option } = Select

const AllocateToGoalModal = ({ open, onClose, onSave, goals }) => {
  const [form] = Form.useForm()

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave(Number.parseFloat(values.amount), values.goalName)
      form.resetFields()
      onClose()
    })
  }

  // Filter out completed goals
  const incompleteGoals =
    goals?.filter((goal) => {
      const percentage = goal.goalAmount ? Math.floor(((goal.currentAmount || 0) / goal.goalAmount) * 100) : 0
      return percentage < 100
    }) || []

  return (
    <Modal
      title="Allocate to Savings Goal"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} disabled={incompleteGoals.length === 0}>
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
      {incompleteGoals.length > 0 ? (
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="goalName" label="Select Goal" rules={[{ required: true, message: "Please select a goal" }]}>
            <Select placeholder="Select a goal" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              {incompleteGoals.map((goal, index) => {
                const percentage = goal.goalAmount ? Math.floor(((goal.currentAmount || 0) / goal.goalAmount) * 100) : 0

                return (
                  <Option key={index} value={goal.goalName}>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <span>{goal.goalName}</span>
                        <span>
                          ${goal.currentAmount || 0}/${goal.goalAmount}
                        </span>
                      </div>
                      <Progress percent={percentage} size="small" showInfo={false} />
                    </div>
                  </Option>
                )
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Please enter amount" },
              { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Please enter a valid amount" },
            ]}
          >
            <Input placeholder="0.00" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </Form.Item>
        </Form>
      ) : (
        <Empty description="No available goals" image={Empty.PRESENTED_IMAGE_SIMPLE} className="my-8" />
      )}
    </Modal>
  )
}

export default AllocateToGoalModal

