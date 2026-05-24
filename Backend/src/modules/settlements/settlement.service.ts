import { Expense } from '../bills/expense.model';
import { Settlement } from './settlement.model';

export const calculateGroupBalances = async (groupId: string) => {
  const expenses = await Expense.find({ groupId });
  const settlements = await Settlement.find({ groupId, status: 'confirmed' });

  // balance > 0 means the user is owed money
  // balance < 0 means the user owes money
  const balances: Record<string, number> = {};

  expenses.forEach(exp => {
    const memberSource = exp.paymentSources.find(s => s.type === 'MEMBER');
    const memberPaidAmount = memberSource ? memberSource.amount : 0;
    const payerId = memberSource?.memberId?.toString();

    if (memberPaidAmount > 0 && payerId) {
      // Payer's balance goes up by the total they paid
      balances[payerId] = (balances[payerId] || 0) + memberPaidAmount;

      // Everyone's balance goes down by their debt-creating split
      exp.splits.forEach(split => {
        const debtCreatingAmount = exp.amount > 0 ? split.amount * (memberPaidAmount / exp.amount) : 0;
        const uId = split.userId.toString();
        balances[uId] = (balances[uId] || 0) - debtCreatingAmount;
      });
    }
  });

  settlements.forEach(settlement => {
    const payer = settlement.payerId.toString();
    const recipient = settlement.recipientId.toString();
    const amount = settlement.amount;

    balances[payer] = (balances[payer] || 0) + amount; // Payer debt goes down
    balances[recipient] = (balances[recipient] || 0) - amount; // Recipient credit goes down
  });

  return balances;
};

// Simple greedy algorithm to optimize settlements
export const optimizeSettlements = (balances: Record<string, number>) => {
  const debtors = Object.keys(balances).filter(k => balances[k] < -0.01).map(k => ({ id: k, amount: -balances[k] }));
  const creditors = Object.keys(balances).filter(k => balances[k] > 0.01).map(k => ({ id: k, amount: balances[k] }));

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amount: Number(amount.toFixed(2))
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
};
