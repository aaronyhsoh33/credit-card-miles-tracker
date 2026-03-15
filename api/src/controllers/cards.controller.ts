import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import * as cardsService from '../services/cards.service';

export async function listCards(req: Request, res: Response, next: NextFunction) {
  try {
    const { bank, category } = req.query as { bank?: string; category?: string };
    const cards = await cardsService.listCards({ bank, categorySlug: category });
    res.json({ success: true, data: cards });
  } catch (err) {
    next(err);
  }
}

export async function getCard(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(createError(400, 'Invalid card id'));
    const card = await cardsService.getCard(id);
    if (!card) return next(createError(404, 'Card not found'));
    res.json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
}
