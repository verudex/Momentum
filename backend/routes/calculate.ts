import express from 'express';
import { estimateCalories } from '../controllers/calculateController';

const router = express.Router();
router.post('/', (req, res, next) => {
  estimateCalories(req, res, next).catch(next);
});

export default router;