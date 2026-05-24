import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useAppStore } from '../store';

interface AddFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const AddFundModal: React.FC<AddFundModalProps> = ({ isOpen, onClose, groupId }) => {
  const { language, addFund } = useAppStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      addFund(groupId, numAmount, note || (language === 'vi' ? 'Thêm quỹ' : 'Add fund'));
      setAmount('');
      setNote('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'vi' ? 'Thêm Quỹ Nhóm' : 'Add Group Fund'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={language === 'vi' ? 'Số tiền' : 'Amount'}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
          min="0"
          step="0.01"
        />
        <Input
          label={language === 'vi' ? 'Ghi chú (Tùy chọn)' : 'Note (Optional)'}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: Nộp quỹ đầu tháng' : 'e.g. Monthly contribution'}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" className="flex-1 font-bold" onClick={onClose} type="button">
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button type="submit" className="flex-1 font-bold shadow-md">
            {language === 'vi' ? 'Xác Nhận' : 'Confirm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
