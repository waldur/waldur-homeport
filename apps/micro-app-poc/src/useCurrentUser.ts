import { useEffect, useState } from 'react';
// waldur-js-client is deliberately absent from this app's own package.json
// — same reasoning as packages/api-client/src/requestHelpers.ts and
// packages/auth-core/src/client.ts: resolving it via workspace hoisting
// means this always sees root's exact pinned/linked SDK build, not a
// second, potentially-drifted copy declared here.
import { usersMeRetrieve } from 'waldur-js-client';
// CurrentUser is UserMenu.tsx's own prop contract, not a type this app
// owns — importing it from there (rather than a second, separately
// maintained copy here) is what keeps the two from drifting apart.
import { CurrentUser } from 'waldur-ui';

// Same /users/me/ endpoint and fields src/navigation/header/UserDropdown.tsx's
// real dropdown reads across its header block (full_name/email/image),
// trigger (first_name/is_staff), and its UserToken/UserIpAddress menu items
// (token/ip_address) — TopBar's avatar used to show a hardcoded "MS"
// placeholder with no name at all, which is where all real parity with that
// component was lost. Stays null (falls back to that same placeholder, see
// OrgDashboardMock's TopBar usage) on any failure — no backend/not
// authenticated is a normal dev-time state here, not an error worth
// surfacing over a decorative header element.
export function useCurrentUser(): CurrentUser | null {
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

  return user;
}
