import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Button } from '../Button';
import { Input } from '../Input';
import { Avatar } from '../Avatar';
import { ChevronDown, ArrowRight, ArrowLeft, Percent, Calculator, Users } from 'lucide-react';
import { formatCurrency, getCategoryLabel, getCategoryEmoji } from '../../utils/formatters';

interface CreateBillFlowProps {
  onClose: () => void;
}

export const CreateBillFlow: React.FC<CreateBillFlowProps> = ({ onClose }) => {
  const { groups, currentUser, language, addExpense, addToast, currency } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedGroupId, setSelectedGroupId] = useState(groups.length > 0 ? groups[0].id : '');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(currentUser?.id || '');
  const [notes, setNotes] = useState('');

  // Split State
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'exact'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});

  const targetGroup = groups.find(g => g.id === selectedGroupId);

  // Initialize custom splits if members change
  useEffect(() => {
    if (targetGroup && amount && splitType !== 'equal') {
      const initial: Record<string, number> = {};
      const numAmount = parseFloat(amount) || 0;
      targetGroup.members.forEach(m => {
        if (splitType === 'percentage') {
          initial[m.id] = parseFloat((100 / targetGroup.members.length).toFixed(2));
        } else if (splitType === 'exact') {
          initial[m.id] = parseFloat((numAmount / targetGroup.members.length).toFixed(2));
        }
      });
      setCustomSplits(initial);
    }
  }, [targetGroup?.members, amount, splitType]);

  const handleNext = () => {
    if (step === 1) {
      if (!title || !amount || !selectedGroupId || !paidBy) {
        addToast(language === 'vi' ? 'Vui lòng nhập đầy đủ thông tin' : 'Please fill all fields', 'error');
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
      splits = targetGroup.members.map(m => ({
        userId: m.id,
        amount: perPerson,
        percentage: 100 / targetGroup.members.length,
      }));
    } else if (splitType === 'percentage') {
      let totalP = 0;
      Object.values(customSplits).forEach(v => totalP += (v || 0));
      
      // Allow minor float differences (e.g. 99.99%)
      if (Math.abs(totalP - 100) > 0.1) {
        addToast(language === 'vi' ? `Tổng phần trăm phải là 100% (Hiện tại: ${totalP}%)` : `Total percentage must be 100% (Current: ${totalP}%)`, 'error');
        return;
      }
      
      splits = targetGroup.members.map(m => {
        const p = customSplits[m.id] || 0;
        return {
          userId: m.id,
          amount: (amountNum * p) / 100,
          percentage: p,
        };
      });
    } else if (splitType === 'exact') {
      let totalE = 0;
      Object.values(customSplits).forEach(v => totalE += (v || 0));
      
      if (Math.abs(totalE - amountNum) > 1) {
        addToast(language === 'vi' ? `Tổng số tiền phải bằng ${formatCurrency(amountNum, currency)}` : `Total amount must equal ${formatCurrency(amountNum, currency)}`, 'error');
        return;
      }

      splits = targetGroup.members.map(m => ({
        userId: m.id,
        amount: customSplits[m.id] || 0,
      }));
    }

    addExpense({
      groupId: selectedGroupId,
      title,
      amount: amountNum,
      paidBy,
      splitType,
      splits,
      category,
      notes,
    });

    onClose();
  };

  if (groups.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {language === 'vi' ? 'Bạn cần tạo một nhóm trước khi thêm chi phí!' : 'You must create a group before adding an expense!'}
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
              {language === 'vi' ? 'Chọn nhóm' : 'Select Group'}
            </label>
            <div className="relative">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none font-bold"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <Input
            label={language === 'vi' ? 'Tên chi phí' : 'Expense Title'}
            placeholder="e.g. Cơm trưa, Grab..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-bold text-lg"
            required
          />

          <Input
            label={language === 'vi' ? 'Số tiền' : 'Amount'}
            type="number"
            placeholder="e.g. 150000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-black text-xl text-primary-500"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
                {language === 'vi' ? 'Người trả tiền' : 'Paid By'}
              </label>
              <div className="relative">
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none font-bold"
                >
                  {targetGroup?.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
                {language === 'vi' ? 'Danh mục' : 'Category'}
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
            {language === 'vi' ? 'Tiếp tục' : 'Next'}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <h4 className="font-bold text-lg mb-2">{language === 'vi' ? 'Bạn muốn chia thế nào?' : 'How do you want to split?'}</h4>
          
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
                <h5 className="font-bold text-slate-800 dark:text-slate-100">{language === 'vi' ? 'Chia đều' : 'Split Equally'}</h5>
                <p className="text-xs text-slate-500">{language === 'vi' ? 'Chia đều số tiền cho tất cả thành viên' : 'Divide the cost evenly among all members'}</p>
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
                <h5 className="font-bold text-slate-800 dark:text-slate-100">{language === 'vi' ? 'Theo phần trăm' : 'By Percentage'}</h5>
                <p className="text-xs text-slate-500">{language === 'vi' ? 'Phân bổ theo tỷ lệ % (tổng 100%)' : 'Allocate by percentages (total 100%)'}</p>
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
                <h5 className="font-bold text-slate-800 dark:text-slate-100">{language === 'vi' ? 'Nhập số tiền chính xác' : 'Exact Amounts'}</h5>
                <p className="text-xs text-slate-500">{language === 'vi' ? 'Nhập chính xác số tiền từng người nợ' : 'Specify exactly how much each person owes'}</p>
              </div>
            </button>
          </div>

          <Button type="button" variant="ghost" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {language === 'vi' ? 'Quay lại' : 'Back'}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg">{language === 'vi' ? 'Chi tiết chia tiền' : 'Split Details'}</h4>
            <span className="text-sm font-black text-primary-500">{formatCurrency(parseFloat(amount), currency)}</span>
          </div>

          {splitType === 'equal' && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex flex-col gap-3">
                {targetGroup?.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} avatarColor={member.avatarColor} size="sm" />
                      <span className="font-semibold text-sm">{member.name}</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {formatCurrency(parseFloat(amount) / targetGroup.members.length, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {splitType === 'percentage' && (
            <div className="flex flex-col gap-3">
              {targetGroup?.members.map(member => (
                <div key={member.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                  <Avatar name={member.name} avatarColor={member.avatarColor} size="sm" />
                  <span className="font-semibold text-sm flex-grow truncate">{member.name}</span>
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 text-right rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                      value={customSplits[member.id] || ''}
                      onChange={(e) => setCustomSplits({ ...customSplits, [member.id]: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="font-bold text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {splitType === 'exact' && (
            <div className="flex flex-col gap-3">
              {targetGroup?.members.map(member => (
                <div key={member.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                  <Avatar name={member.name} avatarColor={member.avatarColor} size="sm" />
                  <span className="font-semibold text-sm flex-grow truncate">{member.name}</span>
                  <div className="flex items-center gap-2 w-36 shrink-0">
                    <input
                      type="number"
                      className="w-full px-3 py-2 text-right rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                      value={customSplits[member.id] || ''}
                      onChange={(e) => setCustomSplits({ ...customSplits, [member.id]: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3 px-0">
              {language === 'vi' ? 'Quay lại' : 'Back'}
            </Button>
            <Button type="submit" variant="primary" className="w-2/3 font-bold">
              {language === 'vi' ? 'Xác nhận tạo' : 'Create Bill'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
