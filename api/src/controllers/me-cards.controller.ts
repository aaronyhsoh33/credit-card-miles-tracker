import { Request, Response, NextFunction } from 'express';
import * as meCardsService from '../services/me-cards.service';

export async function getUserCards(req: Request, res: Response, next: NextFunction) {
  try {
    const cards = await meCardsService.getUserCards(req.user!.id);
    res.json({ success: true, data: cards });
  } catch (err) {
    next(err);
  }
}

export async function addUserCard(req: Request, res: Response, next: NextFunction) {
  try {
    const { cardId, nickname } = req.body;
    const userCard = await meCardsService.addUserCard(req.user!.id, cardId, nickname);
    res.status(201).json({ success: true, data: userCard });
  } catch (err) {
    next(err);
  }
}

export async function removeUserCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = parseInt(req.params.cardId, 10);
    await meCardsService.removeUserCard(req.user!.id, cardId);
    res.json({ success: true, data: { message: 'Card removed from wallet' } });
  } catch (err) {
    next(err);
  }
}

export async function updateUserCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = parseInt(req.params.cardId, 10);
    const { nickname } = req.body;
    const userCard = await meCardsService.updateUserCard(req.user!.id, cardId, nickname);
    res.json({ success: true, data: userCard });
  } catch (err) {
    next(err);
  }
}
