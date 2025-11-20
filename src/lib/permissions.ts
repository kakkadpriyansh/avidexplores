export function hasPermission(session: any, permission: string): boolean {
  if (!session) return false;
  if (session.user.role === 'ADMIN') return true;
  if (session.user.role === 'SUB_ADMIN') {
    return session.user.permissions?.includes(permission) || false;
  }
  return false;
}
