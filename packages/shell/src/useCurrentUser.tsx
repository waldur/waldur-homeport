import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in
// packages/api-client/src/requestHelpers.ts.
import { usersMeRetrieve } from 'waldur-js-client';

// CurrentUser is UserMenu.tsx's own prop contract, not a type this file
// owns — importing it from there (rather than a second, separately
// maintained copy here) is what keeps the two from drifting apart.
import { CurrentUser } from './UserMenu';

const CurrentUserContext = createContext<CurrentUser | null | undefined>(
  undefined,
);

/**
 * Constructed once, inside AppShell, rather than by each app. By the time
 * AppShell mounts, bootstrapMicroApp() has already run configureAuthCore()/
 * initApiClient() (see bootstrap.ts), so this authenticated /users/me/ call
 * needs no app-specific wiring — the same /users/me/ endpoint and fields
 * src/navigation/header/UserDropdown.tsx's real dropdown reads (full_name/
 * email/image/first_name/is_staff/token/ip_address). Stays null (falls back
 * to UserMenu's own placeholder) on any failure — no backend/not
 * authenticated is a normal dev-time state here, not an error worth
 * surfacing over a decorative header element.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    usersMeRetrieve()
      .then((result) => {
        if (cancelled || !result.data) return;
        setUser({
          fullName: result.data.full_name,
          firstName: result.data.first_name,
          email: result.data.email,
          isStaff: Boolean(result.data.is_staff),
          imageSrc: result.data.image ?? undefined,
          token: result.data.token ?? undefined,
          ipAddress: result.data.ip_address,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

/** Must be called from inside <AppShell> — its Provider is what fetches the value. */
export function useCurrentUser(): CurrentUser | null {
  const value = useContext(CurrentUserContext);
  if (value === undefined) {
    throw new Error('useCurrentUser() must be used inside <AppShell>.');
  }
  return value;
}
