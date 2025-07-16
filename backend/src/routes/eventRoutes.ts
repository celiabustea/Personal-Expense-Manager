import { Router } from 'express';
import eventController from '@controllers/eventController';

const router = Router();
router.get('/', eventController.getUsers);

export default router;
