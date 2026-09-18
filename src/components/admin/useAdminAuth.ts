import { useCallback, useEffect, useState } from 'react';
import { adminLogin, checkSession, logoutRequest } from '@/lib/api';

/**
 * Shared admin session state.
 *
 * The real credential is an HttpOnly cookie the browser sends automatically;
 * only a non-sensitive "am I signed in" flag is persisted, so a page reload does
 * not bounce the user to the login form before the session check returns.
 */
const SIGNED_IN_KEY = 'asb-admin-signed-in';

const readFlag = () => {
  try {
    return sessionStorage.getItem(SIGNED_IN_KEY) ? 'cookie-session' : '';
  } catch {
    // Private windows and blocked site data throw on access.
    return '';
  }
};

export const useAdminAuth = () => {
  const [token, setToken] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!readFlag()) return;

    let active = true;
    void checkSession().then((valid) => {
      if (!active) return;
      if (valid) {
        setToken('cookie-session');
        return;
      }
      try {
        sessionStorage.removeItem(SIGNED_IN_KEY);
      } catch {
        /* nothing to clear */
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoggingIn(true);
    try {
      const next = await adminLogin(username, password);
      try {
        sessionStorage.setItem(SIGNED_IN_KEY, '1');
      } catch {
        /* non-fatal: the cookie still authenticates this tab */
      }
      setToken(next || 'cookie-session');
      return next;
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SIGNED_IN_KEY);
    } catch {
      /* nothing to clear */
    }
    void logoutRequest();
    setToken('');
  }, []);

  return { token, setToken, loggingIn, login, logout, signedIn: Boolean(token) };
};
