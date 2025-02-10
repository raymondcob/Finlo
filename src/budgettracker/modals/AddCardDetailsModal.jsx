import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';

const AddCardDetailsModal = ({ open, onClose, onSave }) => {
  const [cardHolder, setCardHolder] = useState('');
  const [validThru, setValidThru] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!cardHolder || !validThru || !cardNumber || !balance) {
      setError('All fields are required');
      return;
    }
    const details = {
      cardHolder,
      validThru,
      cardNumber,
      balance: parseFloat(balance).toFixed(2),
    };
    onSave(details);
    onClose();
  };

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
    >
      <div className="mb-4">
        <label className="block mb-2">Card Holder</label>
        <Input
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Valid Thru</label>
        <Input
          value={validThru}
          onChange={(e) => setValidThru(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Card Number</label>
        <Input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Initial Balance</label>
        <Input
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-red-500 text-sm">
        Note: You can only set the initial balance once. It will be updated through transactions.
      </p>
    </Modal>
  );
};

export default AddCardDetailsModal;