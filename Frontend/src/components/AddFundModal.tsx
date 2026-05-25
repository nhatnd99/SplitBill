import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { queryKeys } from '@/api/queryKeys';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface AddFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const AddFundModal: React.FC<AddFundModalProps> = ({ isOpen, onClose, groupId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const addFundMutation = useMutation({
    mutationFn: (data: { amount: number, note: string }) => groupsApi.addFund(groupId, data.amount, data.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      toast.success(t('fund.added'));
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
      addFundMutation.mutate({ amount: numAmount, note: note || t('fund.addFund') });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('fund.title')}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t('common.amount')}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
          min="0"
          step="0.01"
        />
        <Input
          label={t('fund.noteOptional')}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('fund.notePlaceholder')}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" className="flex-1 font-bold" onClick={onClose} type="button" disabled={addFundMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="flex-1 font-bold shadow-md" disabled={addFundMutation.isPending} leftIcon={addFundMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
            {addFundMutation.isPending ? t('fund.processing') : t('common.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
