// backend/controllers/calculateController.ts
import { Request, Response, NextFunction } from "express";
import { getCaloriesFromGemini, getWorkoutPlanFromGemini } from "../utils/geminiClient";

export const estimateCalories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Missing input text." });

    const response = await getCaloriesFromGemini(input);
    res.json({ result: response });
  } catch (error) {
    next(error);
  }
};

export const generateWorkoutPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Missing input text." });

    const response = await getWorkoutPlanFromGemini(input);
    res.json({ result: response });
  } catch (error) {
    next(error);
  }
};
