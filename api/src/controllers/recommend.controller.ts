import { Request, Response, NextFunction } from 'express';
import * as recommendService from '../services/recommend.service';

export async function recommend(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, amount } = req.query as { category: string; amount?: string };
    const parsedAmount = amount ? parseFloat(amount) : undefined;
    const results = await recommendService.recommendCards(req.user!.id, category, parsedAmount);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function recommendAll(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await recommendService.recommendAllCategories(req.user!.id);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}
