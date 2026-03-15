import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import { prisma } from '../config/database';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return next(createError(404, 'User not found'));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email } = req.body;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user!.id) {
        return next(createError(409, 'Email already in use'));
      }
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { ...(name !== undefined ? { name } : {}), ...(email ? { email } : {}) },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return next(createError(400, 'Current password is incorrect'));
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ success: true, data: { message: 'Password updated' } });
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) {
    next(err);
  }
}
