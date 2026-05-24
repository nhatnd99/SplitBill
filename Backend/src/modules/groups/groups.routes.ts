import { Router } from 'express';
import { createGroup, getGroup, joinGroup, addFund } from './groups.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createGroup);
router.get('/:id', getGroup);
router.post('/join', joinGroup);
router.post('/:id/fund', addFund);

export default router;
