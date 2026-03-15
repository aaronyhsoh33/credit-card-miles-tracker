import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import createError from 'http-errors';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AuthUser } from '../types';

export async function register(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw createError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const tokens = await generateTokens(user);
  return { user, ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw createError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError(401, 'Invalid email or password');

  const safeUser = { id: user.id, email: user.email, name: user.name };
  const tokens = await generateTokens(safeUser);
  return { user: safeUser, ...tokens };
}

export async function refreshTokens(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw createError(401, 'Invalid or expired refresh token');
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: stored.userId },
    select: { id: true, email: true, name: true },
  });

  return generateTokens(user);
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

async function generateTokens(user: AuthUser) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
}
