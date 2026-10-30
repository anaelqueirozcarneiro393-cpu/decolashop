import { auth } from '@/auth';

/**
 * Sessão NextAuth de gerente/admin (o papel vem do token, nunca do corpo da requisição).
 */
export async function isManagerSession(): Promise<boolean> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === 'gerente' || role === 'admin';
}
