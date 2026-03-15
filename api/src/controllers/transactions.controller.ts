import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import * as txService from '../services/transactions.service';

export async function createTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const tx = await txService.createTransaction(req.user!.id, req.body);
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await txService.listTransactions(req.user!.id, req.query as any);
    res.json({
      success: true,
      data: result.items,
      meta: { page: result.page, limit: result.limit, total: result.total },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(createError(400, 'Invalid id'));
    const tx = await txService.getTransaction(req.user!.id, id);
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(createError(400, 'Invalid id'));
    const tx = await txService.updateTransaction(req.user!.id, id, req.body);
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(createError(400, 'Invalid id'));
    await txService.deleteTransaction(req.user!.id, id);
    res.json({ success: true, data: { message: 'Transaction deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const summary = await txService.getTransactionSummary(req.user!.id, { from, to });
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}
