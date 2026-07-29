import { queryClient } from '@/core/queryClient';
import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@/marketplace/orders/list/constants';
import store from '@/store/store';
import { keysListTable } from '@/user/keys/constants';
import { UsersService } from '@/user/UsersService';
import { setCurrentUser } from '@/workspace/actions';
import { getUser } from '@/workspace/selectors';

export interface RealtimeEvent {
  object_type?: string;
  order_uuid?: string;
  resource_uuid?: string;
  user_uuid?: string;
}

const DEBOUNCE_MS = 500;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

// Trailing debounce per event identity so a burst of transitions for the same
// object collapses into one round of refetches.
const debounced = (key: string, run: () => void) => {
  const existing = pending.get(key);
  if (existing) {
    clearTimeout(existing);
  }
  pending.set(
    key,
    setTimeout(() => {
      pending.delete(key);
      run();
    }, DEBOUNCE_MS),
  );
};

const invalidate = (queryKey: string[]) =>
  queryClient.invalidateQueries({ queryKey });

// Only invalidations here — never a component-level refetch(); mounted queries
// refetch, unmounted ones are just marked stale (same as TableRefreshButton).
export const applyRealtimeEvent = (event: RealtimeEvent) => {
  switch (event.object_type) {
    case 'order':
      debounced(`order:${event.order_uuid}`, () => {
        if (event.order_uuid) {
          invalidate(['OrderDetails', event.order_uuid]);
        }
        invalidate(['table', TABLE_MARKETPLACE_ORDERS]);
        invalidate(['table', TABLE_PUBLIC_ORDERS]);
        invalidate(['table', TABLE_PENDING_PUBLIC_ORDERS]);
        invalidate(['table', TABLE_PENDING_PROVIDER_PUBLIC_ORDERS]);
        if (event.resource_uuid) {
          invalidateResource(event.resource_uuid);
        }
      });
      break;
    case 'resource':
      debounced(`resource:${event.resource_uuid}`, () => {
        if (event.resource_uuid) {
          invalidateResource(event.resource_uuid);
        }
        invalidate(['table', 'ProjectResourcesList']);
      });
      break;
    case 'user_profile':
      // Self-scope delivers only the current user's profile events; the
      // canonical user object lives in redux, so re-fetch it there.
      debounced('user_profile', refreshCurrentUser);
      break;
    case 'user_ssh_key':
      debounced('user_ssh_key', () => {
        invalidate(['table', keysListTable]);
      });
      break;
    case 'user_role':
      debounced(`user_role:${event.user_uuid}`, () => {
        invalidate(['table', 'project-users']);
        // Own role changed → permission-derived UI (menus, action buttons)
        // reads from the redux user; refresh it.
        if (event.user_uuid && event.user_uuid === currentUserUuid()) {
          refreshCurrentUser();
        }
      });
      break;
    default:
      break;
  }
};

const currentUserUuid = (): string | undefined =>
  getUser(store.getState())?.uuid;

const refreshCurrentUser = () => {
  UsersService.getCurrentUser().then((user) => {
    store.dispatch(setCurrentUser(user));
  });
};

const invalidateResource = (resourceUuid: string) => {
  invalidate(['resource-details', resourceUuid]);
  invalidate(['resource-details-page', resourceUuid]);
  invalidate(['ResourceState', resourceUuid]);
  // Payloads don't carry the scope URL, so invalidate the whole popover cache.
  invalidate(['ActionsPopover']);
};
