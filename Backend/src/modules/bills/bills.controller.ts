import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Expense } from './expense.model';
import { Group } from '../groups/group.model';
import { Activity } from '../activities/activity.model';
import { AppError } from '../../utils/AppError';
import { getIO } from '../sockets/socket.service';
import { z } from 'zod';

const createExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  paymentSources: z.array(z.object({
    type: z.enum(['GROUP_FUND', 'MEMBER']),
    memberId: z.string().optional(),
    amount: z.number().positive()
  })).min(1),
  splitType: z.enum(['equal', 'percentage', 'exact', 'item']),
  splits: z.array(z.object({
    userId: z.string(),
    amount: z.number().nonnegative(),
    percentage: z.number().optional()
  })).min(1),
  category: z.string(),
  notes: z.string().optional()
});

export const createExpense = async (req: any, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const data = createExpenseSchema.parse(req.body);
    const { groupId } = req.params;

    const group = await Group.findById(groupId).session(session);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    // Verify Fund Payment
    const fundSource = data.paymentSources.find(s => s.type === 'GROUP_FUND');
    if (fundSource) {
      if (group.fundBalance < fundSource.amount) {
        throw new AppError('Insufficient group fund balance', 400);
      }
      group.fundBalance -= fundSource.amount;
    }

    group.totalExpense += data.amount;

    const expense = new Expense({
      ...data,
      groupId,
      createdBy: req.user._id,
    });

    await expense.save({ session });
    await group.save({ session });

    await Activity.create([{
      groupId,
      type: 'expense_add',
      userId: req.user._id,
      userName: req.user.name,
      details: { expenseId: expense._id, expenseTitle: expense.title, amount: expense.amount },
    }], { session });

    await session.commitTransaction();
    session.endSession();

    getIO().to(groupId).emit('bill:created', expense);
    getIO().to(groupId).emit('fund:updated', { fundBalance: group.fundBalance });

    res.status(201).json({
      status: 'success',
      data: { expense },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 400));
  }
};

export const getGroupExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId }).sort('-date');
    res.status(200).json({
      status: 'success',
      results: expenses.length,
      data: { expenses },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const deleteExpense = async (req: any, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { groupId, expenseId } = req.params;

    const expense = await Expense.findById(expenseId).session(session);
    if (!expense) throw new AppError('Expense not found', 404);

    const group = await Group.findById(groupId).session(session);
    if (!group) throw new AppError('Group not found', 404);

    const fundSource = expense.paymentSources.find(s => s.type === 'GROUP_FUND');
    if (fundSource) {
      group.fundBalance += fundSource.amount;
    }

    group.totalExpense = Math.max(0, group.totalExpense - expense.amount);
    
    await Expense.findByIdAndDelete(expenseId).session(session);
    await group.save({ session });

    await Activity.create([{
      groupId,
      type: 'expense_delete',
      userId: req.user._id,
      userName: req.user.name,
      details: { expenseTitle: expense.title, amount: expense.amount },
    }], { session });

    await session.commitTransaction();
    session.endSession();

    getIO().to(groupId).emit('bill:deleted', { expenseId });
    getIO().to(groupId).emit('fund:updated', { fundBalance: group.fundBalance });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 400));
  }
};
