import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../users/user.model';
import { AppError } from '../../utils/AppError';
import { z } from 'zod';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any,
  });
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  avatarColor: z.string().optional(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if email already exists
    if (data.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return next(new AppError('Email already in use', 400));
      }
    }

    let hashedPassword;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12);
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      avatarColor: data.avatarColor,
    });

    const token = generateToken(user._id as unknown as string);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
        },
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password as string))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = generateToken(user._id as unknown as string);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
        },
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarColor: req.user.avatarColor,
      },
    },
  });
};
