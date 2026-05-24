import { Request, Response, NextFunction } from 'express';
import { calculateGroupBalances, optimizeSettlements } from './settlement.service';
import { Settlement } from './settlement.model';
import { Activity } from '../activities/activity.model';
import { User } from '../users/user.model';
import { AppError } from '../../utils/AppError';
import { getIO } from '../sockets/socket.service';

export const getBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    
    const balances = await calculateGroupBalances(groupId as string);
    const optimizedTransactions = optimizeSettlements(balances);

    res.status(200).json({
      status: 'success',
      data: { 
        rawBalances: balances,
        optimizedTransactions 
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const settleDebt = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { recipientId, amount } = req.body;
    const payerId = req.user._id;

    if (!recipientId || !amount) {
      return next(new AppError('Recipient and amount are required', 400));
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return next(new AppError('Recipient not found', 404));

    const settlement = await Settlement.create({
      groupId,
      payerId,
      recipientId,
      amount,
      status: 'confirmed'
    });

    await Activity.create({
      groupId,
      type: 'settlement',
      userId: payerId,
      userName: req.user.name,
      details: { amount, recipientId, recipientName: recipient.name },
    });

    getIO().to(groupId).emit('settlement:updated', settlement);

    res.status(201).json({
      status: 'success',
      data: { settlement },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};
