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

export interface CurrentUser {
  uuid: string;
  fullName: string;
  firstName: string;
  email: string;
  isStaff: boolean;
  isSupport: boolean;
  imageSrc?: string;
  token?: string;
  ipAddress: string;
  /** The names of the user's active roles, for the quick shortcuts menu's
   * visibility rules (see microApps.ts). */
  roleNames: string[];
}

/** The names of the roles a user holds now: active, not expired. */
export const activeRoleNames = (
  permissions?: Array<{
    role_name: string;
    is_active?: boolean | null;
    expiration_time?: string | null;
  }>,
): string[] => {
  const now = Date.now();
  return [
    ...new Set(
      (permissions ?? [])
        .filter(
          (permission) =>
            permission.is_active !== false &&
            (!permission.expiration_time ||
              new Date(permission.expiration_time).getTime() > now),
        )
        .map((permission) => permission.role_name),
    ),
  ];
};

type UsersMeData = NonNullable<
  Awaited<ReturnType<typeof usersMeRetrieve>>['data']
>;

/** The /users/me/ answer as the shell uses it. */
export const toCurrentUser = (data: UsersMeData): CurrentUser => ({
  uuid: data.uuid,
  fullName: data.full_name,
  firstName: data.first_name,
  email: data.email,
  isStaff: Boolean(data.is_staff),
  isSupport: Boolean(data.is_support),
  imageSrc: data.image ?? undefined,
  token: data.token ?? undefined,
  ipAddress: data.ip_address,
  roleNames: activeRoleNames(data.permissions),
});

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
        setUser(toCurrentUser(result.data));
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
