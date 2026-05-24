import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useAppStore } from '../store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups.api';
import { queryKeys } from '../api/queryKeys';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface AddFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const AddFundModal: React.FC<AddFundModalProps> = ({ isOpen, onClose, groupId }) => {
  const { language } = useAppStore();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const addFundMutation = useMutation({
    mutationFn: (data: { amount: number, note: string }) => groupsApi.addFund(groupId, data.amount, data.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      toast.success(language === 'vi' ? 'Đã thêm quỹ!' : 'Fund added!');
      setAmount('');
      setNote('');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add fund');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      addFundMutation.mutate({ amount: numAmount, note: note || (language === 'vi' ? 'Thêm quỹ' : 'Add fund') });
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
          <Button variant="ghost" className="flex-1 font-bold" onClick={onClose} type="button" disabled={addFundMutation.isPending}>
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button type="submit" className="flex-1 font-bold shadow-md" disabled={addFundMutation.isPending} leftIcon={addFundMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
            {addFundMutation.isPending ? (language === 'vi' ? 'Đang xử lý...' : 'Processing...') : (language === 'vi' ? 'Xác Nhận' : 'Confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
