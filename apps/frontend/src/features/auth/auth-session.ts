const AUTH_SESSION_HINT_KEY = 'event-ops.auth-session-active';

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

export function setAuthSessionHint(): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, 'true');
  } catch {
    return;
  }
}

export function clearAuthSessionHint(): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
  } catch {
    return;
  }
}

export function hasAuthSessionHint(): boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === 'true';
  } catch {
    return false;
  }
}
