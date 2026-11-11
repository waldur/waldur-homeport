import { ReauthenticationCancelled } from '@/auth/reauthentication/api';
import { cancelPendingReauthentication } from '@/auth/reauthentication/prompt';
import { ENV } from '@/core/config';
import { BOOTSTRAP_QUERY_KEY, queryClient } from '@/core/queryClient';
import { translate } from '@/i18n';
import { resetSession } from '@/store/reducers';
import store from '@/store/store';
import { resetUserCache } from '@/user/UsersService';

/**
 * Forgets everything that belongs to a user session without reloading the
 * document: the Redux store, cached roles, in-flight user fetches and — when
 * asked — the react-query cache.
 *
 * Runs at the start of every login (with the query cache) so data cached for
 * one account can never leak into the next one, and on logout (without it).
 * Purging observed queries while the authenticated layout is still mounted
 * would make every mounted query refetch without a token; the next login
 * purges them anyway, before anything of the new user is fetched.
 *
 * The bootstrap query is always kept: it holds the public configuration and
 * removing it would re-suspend the whole application — exactly the second
 * trip through the boot splash this reset exists to avoid.
 */
export function resetSessionState({ queries = true } = {}) {
  if (queries) {
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== BOOTSTRAP_QUERY_KEY[0],
    });
  }
  ENV.roles = [];
  resetUserCache();
  store.dispatch(resetSession());
  // A "Confirm it's you" still open belongs to the session that is ending
  // (signed out, expired, or another account signing in): fail its change.
  cancelPendingReauthentication(
    new ReauthenticationCancelled(
      translate('Nothing was changed, because the session ended.'),
    ),
  );
}
