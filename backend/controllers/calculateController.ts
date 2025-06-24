import { Request, Response, NextFunction } from 'express';
import { getCaloriesFromGemini } from '../utils/geminiClient';

export const estimateCalories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: 'Missing input text.' });
    }

    const response = await getCaloriesFromGemini(input);
    res.json({ result: response });
  } catch (error) {
    next(error);
  }
};