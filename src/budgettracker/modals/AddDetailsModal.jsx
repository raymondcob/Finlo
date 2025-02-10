import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';

const AddDetailsModal = ({ open, onClose, onSave }) => {
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!balance) {
      setError('Balance is required');
      return;
    }
    const details = {
      balance: parseFloat(balance).toFixed(2),
    };
    onSave(details);
    onClose();
  };

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
    >
      <div className="mb-4">
        <label className="block mb-2">Balance</label>
        <Input
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <p className="text-red-500 text-sm">
        Note: You can only set the initial balance once. It will be updated through transactions.
      </p>
    </Modal>
  );
};

export default AddDetailsModal;