import { Request, Response, NextFunction } from 'express';
import { Group } from './group.model';
import { Activity } from '../activities/activity.model';
import { AppError } from '../../utils/AppError';
import { z } from 'zod';
import crypto from 'crypto';
import { getIO } from '../sockets/socket.service';

const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().default('other'),
});

const generateInviteCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
};

export const createGroup = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = createGroupSchema.parse(req.body);
    const userId = req.user._id;

    const newGroup = await Group.create({
      ...data,
      inviteCode: generateInviteCode(),
      members: [userId],
      createdBy: userId,
    });

    await Activity.create({
      groupId: newGroup._id,
      type: 'group_create',
      userId,
      userName: req.user.name,
      details: { groupName: newGroup.name },
    });

    const populatedGroup = await Group.findById(newGroup._id).populate('members', 'name email avatarColor avatarUrl');

    res.status(201).json({
      status: 'success',
      data: { group: populatedGroup },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const joinGroup = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return next(new AppError('Invite code is required', 400));

    const group = await Group.findOne({ inviteCode });
    if (!group) return next(new AppError('Invalid invite code', 404));

    if (group.members.includes(req.user._id)) {
      return res.status(200).json({ status: 'success', message: 'Already a member', data: { groupId: group._id } });
    }

    group.members.push(req.user._id);
    await group.save();

    await Activity.create({
      groupId: group._id,
      type: 'member_joined',
      userId: req.user._id,
      userName: req.user.name,
      details: { memberName: req.user.name },
    });

    getIO().to(group._id.toString()).emit('member:joined', { userId: req.user._id, userName: req.user.name });

    const populatedGroup = await Group.findById(group._id).populate('members', 'name email avatarColor avatarUrl');

    res.status(200).json({
      status: 'success',
      data: { group: populatedGroup },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email avatarColor avatarUrl');
    if (!group) return next(new AppError('Group not found', 404));

    res.status(200).json({
      status: 'success',
      data: { group },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const addFund = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return next(new AppError('Valid amount is required', 400));

    const group = await Group.findById(req.params.id);
    if (!group) return next(new AppError('Group not found', 404));

    // Only owner can add fund (business rule)
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Only group owner can add funds', 403));
    }

    const transaction = {
      amount,
      date: new Date(),
      userId: req.user._id,
      userName: req.user.name,
      note: note || 'Fund added',
    };

    group.fundBalance += amount;
    group.fundHistory.unshift(transaction);
    await group.save();

    await Activity.create({
      groupId: group._id,
      type: 'fund_added',
      userId: req.user._id,
      userName: req.user.name,
      details: { amount, note: transaction.note },
    });

    getIO().to(group._id.toString()).emit('fund:updated', { fundBalance: group.fundBalance, transaction });

    res.status(200).json({
      status: 'success',
      data: { fundBalance: group.fundBalance },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};
