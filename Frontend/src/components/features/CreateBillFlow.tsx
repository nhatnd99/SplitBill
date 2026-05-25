import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../Button';
import { Input } from '../Input';
import { Avatar } from '../Avatar';
import { ChevronDown, ArrowRight, ArrowLeft, Percent, Calculator, Users, Loader2 } from 'lucide-react';
import { formatCurrency, getCategoryLabel, getCategoryEmoji } from '../../utils/formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../../api/bills.api';
import { queryKeys } from '../../api/queryKeys';
import toast from 'react-hot-toast';

interface CreateBillFlowProps {
  onClose: () => void;
}

export const CreateBillFlow: React.FC<CreateBillFlowProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { joinedGroups, language, addToast, currency } = useAppStore();
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedGroupId, setSelectedGroupId] = useState(joinedGroups.length > 0 ? joinedGroups[0].id : '');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [notes] = useState('');

  // Split State
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'exact'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});

  const targetGroup = joinedGroups.find((g: any) => g.id === selectedGroupId);

  const createMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      await billsApi.createExpense(selectedGroupId, expenseData);
    },
    onSuccess: () => {
      toast.success(t('auto.expenseAdded'));
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(selectedGroupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(selectedGroupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances(selectedGroupId) });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create expense');
    }
  });

  // Initialize custom splits if members change
  useEffect(() => {
    if (targetGroup && amount && splitType !== 'equal') {
      const initial: Record<string, number> = {};
      const numAmount = parseFloat(amount) || 0;
      targetGroup.members.forEach((m: any) => {
        const memberId = typeof m === 'string' ? m : m.id;
        if (splitType === 'percentage') {
          initial[memberId] = parseFloat((100 / targetGroup.members.length).toFixed(2));
        } else if (splitType === 'exact') {
          initial[memberId] = parseFloat((numAmount / targetGroup.members.length).toFixed(2));
        }
      });
      setCustomSplits(initial);
    }
  }, [targetGroup?.members, amount, splitType]);

  const handleNext = () => {
    if (step === 1) {
      const numAmount = parseFloat(amount) || 0;
      const groupFundBalance = targetGroup?.fundBalance || 0;
      const coveredByFund = Math.min(numAmount, groupFundBalance);
      const remainingToPay = Math.max(0, numAmount - coveredByFund);

      if (!title || !amount || !selectedGroupId || (remainingToPay > 0 && !paidBy)) {
        addToast(t('auto.pleaseFillAllFields'), 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroup) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // Validate splits before submit
    let splits: { userId: string, amount: number, percentage?: number }[] = [];

    if (splitType === 'equal') {
      const perPerson = amountNum / targetGroup.members.length;
      splits = targetGroup.members.map((m: any) => ({
        userId: typeof m === 'string' ? m : m.id,
        amount: perPerson,
        percentage: 100 / targetGroup.members.length,
      }));
    } else if (splitType === 'percentage') {
      let totalP = 0;
      Object.values(customSplits).forEach(v => totalP += (v || 0));
      
      // Allow minor float differences (e.g. 99.99%)
      if (Math.abs(totalP - 100) > 0.1) {
        addToast(t('auto.totalPercentageMustBe100', { totalP }), 'error');
        return;
      }
      
      splits = targetGroup.members.map((m: any) => {
        const memberId = typeof m === 'string' ? m : m.id;
        const p = customSplits[memberId] || 0;
        return {
          userId: memberId,
          amount: (amountNum * p) / 100,
          percentage: p,
        };
      });
    } else if (splitType === 'exact') {
      let totalE = 0;
      Object.values(customSplits).forEach(v => totalE += (v || 0));
      
      if (Math.abs(totalE - amountNum) > 1) {
        addToast(t('auto.totalAmountMustEqual', { amount: formatCurrency(amountNum, currency) }), 'error');
        return;
      }

      splits = targetGroup.members.map((m: any) => {
        const memberId = typeof m === 'string' ? m : m.id;
        return {
          userId: memberId,
          amount: customSplits[memberId] || 0,
        };
      });
    }

    const groupFundBalance = targetGroup.fundBalance || 0;
    const coveredByFund = Math.min(amountNum, groupFundBalance);
    const remainingToPay = amountNum - coveredByFund;

    const paymentSources: { type: 'GROUP_FUND' | 'MEMBER', amount: number, memberId?: string }[] = [];
    if (coveredByFund > 0) {
      paymentSources.push({ type: 'GROUP_FUND', amount: coveredByFund });
    }
    if (remainingToPay > 0) {
      paymentSources.push({ type: 'MEMBER', memberId: paidBy, amount: remainingToPay });
    }

    createMutation.mutate({
      title,
      amount: amountNum,
      paymentSources,
      splitType,
      splits,
      category,
      notes,
    });
  };

  if (joinedGroups.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('auto.youMustCreateAGroupBefore')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Steps indicator */}
      <div className="flex items-center justify-between px-2 mb-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === i 
                ? 'bg-primary-500 text-white shadow-md' 
                : step > i 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' 
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
            }`}>
              {i}
            </div>
            {i < 3 && (
              <div className={`h-1 w-12 sm:w-24 mx-2 rounded-full transition-colors ${
                step > i ? 'bg-primary-500' : 'bg-slate-100 dark:bg-slate-800'
              }`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
              {t('auto.selectGroup')}
            </label>
            <div className="relative">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none font-bold"
              >
                {joinedGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <Input
            label={t('auto.expenseTitle')}
            placeholder="e.g. Cơm trưa, Grab..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-bold text-lg"
            required
          />

          <Input
            label={t('auto.amount')}
            type="number"
            placeholder="e.g. 150000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-black text-xl text-primary-500"
            required
          />

          {/* Auto Calculate Payment Coverage */}
          {parseFloat(amount) > 0 && targetGroup && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 mb-2">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500">
                <span>{t('auto.billTotal')}</span>
                <span className="text-slate-800 dark:text-slate-200">{formatCurrency(parseFloat(amount), currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-indigo-500">
                <span>{t('auto.coveredByFund')}</span>
                <span>-{formatCurrency(Math.min(parseFloat(amount), targetGroup.fundBalance || 0), currency)}</span>
              </div>
              <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-1"></div>
              <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                <span>{t('auto.remainingToPay')}</span>
                <span>{formatCurrency(Math.max(0, parseFloat(amount) - (targetGroup.fundBalance || 0)), currency)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {parseFloat(amount) > 0 && targetGroup && (parseFloat(amount) - (targetGroup.fundBalance || 0)) > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
                  {t('auto.paidBy')}
                </label>
                <div className="relative">
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none font-bold"
                  >
                    {targetGroup?.members.map((member: any) => {
                      const mId = typeof member === 'string' ? member : member.id;
                      const mName = typeof member === 'string' ? 'User' : member.name;
                      return (
                        <option key={mId} value={mId}>
                          {mName}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              parseFloat(amount) > 0 && targetGroup && (
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 rounded-xl text-center border border-indigo-100 dark:border-indigo-500/20">
                    {t('auto.fullyCoveredByGroupFund')}
                  </span>
                </div>
              )
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
                {t('auto.category')}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none font-bold"
                >
                  {['food', 'transport', 'bills', 'entertainment', 'coffee', 'shopping', 'other'].map(c => (
                    <option key={c} value={c}>
                      {getCategoryEmoji(c)} {getCategoryLabel(c, language)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <Button type="button" onClick={handleNext} className="mt-4" rightIcon={<ArrowRight className="w-4 h-4" />}>
            {t('auto.next')}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <h4 className="font-bold text-lg mb-2">{t('auto.howDoYouWantToSplit')}</h4>
          
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => { setSplitType('equal'); handleNext(); }}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-100">{t('auto.splitEqually')}</h5>
                <p className="text-xs text-slate-500">{t('auto.divideTheCostEvenlyAmongAll')}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSplitType('percentage'); handleNext(); }}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-100">{t('auto.byPercentage')}</h5>
                <p className="text-xs text-slate-500">{t('auto.allocateByPercentagesTotal100')}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSplitType('exact'); handleNext(); }}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-100">{t('auto.exactAmounts')}</h5>
                <p className="text-xs text-slate-500">{t('auto.specifyExactlyHowMuchEachPerson')}</p>
              </div>
            </button>
          </div>

          <Button type="button" variant="ghost" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t('auto.back')}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg">{t('auto.splitDetails')}</h4>
            <span className="text-sm font-black text-primary-500">{formatCurrency(parseFloat(amount), currency)}</span>
          </div>

          {splitType === 'equal' && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex flex-col gap-3">
                {targetGroup?.members.map((member: any) => {
                  const mId = typeof member === 'string' ? member : member.id;
                  const mName = typeof member === 'string' ? 'User' : member.name;
                  const mAvatar = typeof member === 'string' ? undefined : member.avatarColor;
                  return (
                    <div key={mId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={mName} avatarColor={mAvatar} size="sm" />
                        <span className="font-semibold text-sm">{mName}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {formatCurrency(parseFloat(amount) / targetGroup.members.length, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {splitType === 'percentage' && (
            <div className="flex flex-col gap-3">
              {targetGroup?.members.map((member: any) => {
                const mId = typeof member === 'string' ? member : member.id;
                const mName = typeof member === 'string' ? 'User' : member.name;
                const mAvatar = typeof member === 'string' ? undefined : member.avatarColor;
                return (
                  <div key={mId} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                    <Avatar name={mName} avatarColor={mAvatar} size="sm" />
                    <span className="font-semibold text-sm flex-grow truncate">{mName}</span>
                    <div className="flex items-center gap-2 w-32 shrink-0">
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 text-right rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                        value={customSplits[mId] || ''}
                        onChange={(e) => setCustomSplits({ ...customSplits, [mId]: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {splitType === 'exact' && (
            <div className="flex flex-col gap-3">
              {targetGroup?.members.map((member: any) => {
                const mId = typeof member === 'string' ? member : member.id;
                const mName = typeof member === 'string' ? 'User' : member.name;
                const mAvatar = typeof member === 'string' ? undefined : member.avatarColor;
                return (
                  <div key={mId} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                    <Avatar name={mName} avatarColor={mAvatar} size="sm" />
                    <span className="font-semibold text-sm flex-grow truncate">{mName}</span>
                    <div className="flex items-center gap-2 w-36 shrink-0">
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-right rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                        value={customSplits[mId] || ''}
                        onChange={(e) => setCustomSplits({ ...customSplits, [mId]: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button disabled={createMutation.isPending} type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3 px-0">
              {t('auto.back')}
            </Button>
            <Button disabled={createMutation.isPending} type="submit" variant="primary" className="w-2/3 font-bold" leftIcon={createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
              {createMutation.isPending ? (t('auto.creating')) : (t('auto.createBill'))}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
