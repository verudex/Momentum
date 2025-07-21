import express from 'express';
import { estimateCalories, generateWorkoutPlan } from '../controllers/calculateController';

const router = express.Router();

// Route for calorie estimation
router.post('/calories', (req, res, next) => {
  estimateCalories(req, res, next).catch(next);
});

// Route for workout plan generation
router.post('/generate-workout', (req, res, next) => {
  generateWorkoutPlan(req, res, next).catch(next);
});

export default router;
