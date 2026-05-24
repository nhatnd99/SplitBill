import { Router } from 'express';
import { createExpense, getGroupExpenses, deleteExpense } from './bills.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/groups/:groupId/expenses', createExpense);
router.get('/groups/:groupId/expenses', getGroupExpenses);
router.delete('/groups/:groupId/expenses/:expenseId', deleteExpense);

export default router;
