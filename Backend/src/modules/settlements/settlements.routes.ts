import { Router } from 'express';
import { getBalances, settleDebt } from './settlements.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/groups/:groupId/balances', getBalances);
router.post('/groups/:groupId/settlements', settleDebt);

export default router;
