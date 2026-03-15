import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { label: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}
