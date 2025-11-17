import { Response } from 'express';

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

/**
 * Set an HTTP-only authentication cookie
 */
export function setAuthCookie(
  res: Response,
  token: string,
  options: Partial<CookieOptions> = {}
): void {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  const cookieOptions = { ...defaultOptions, ...options };

  res.cookie('authToken', token, cookieOptions);
}

/**
 * Clear the authentication cookie
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}

/**
 * Set a refresh token cookie
 */
export function setRefreshTokenCookie(
  res: Response,
  token: string,
  options: Partial<CookieOptions> = {}
): void {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth/refresh', // Only send with refresh requests
  };

  const cookieOptions = { ...defaultOptions, ...options };

  res.cookie('refreshToken', token, cookieOptions);
}

/**
 * Clear the refresh token cookie
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh',
  });
}

/**
 * Clear all authentication cookies
 */
export function clearAllAuthCookies(res: Response): void {
  clearAuthCookie(res);
  clearRefreshTokenCookie(res);
}
