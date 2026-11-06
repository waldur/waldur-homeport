import { ProviderOfferingDetails, User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

import {
  ACTIVE,
  ARCHIVED,
  DRAFT,
  PAUSED,
  UNAVAILABLE,
} from '../../store/constants';

/** The fields of a listed offering that bulk actions read. */
export type BulkOffering = Pick<
  ProviderOfferingDetails,
  'uuid' | 'name' | 'state' | 'customer_uuid' | 'plans' | 'type'
>;

export interface OfferingFailure<T extends BulkOffering = BulkOffering> {
  offering: T;
  error: unknown;
}

export interface OfferingBatchResult<T extends BulkOffering = BulkOffering> {
  succeeded: T[];
  failed: OfferingFailure<T>[];
}

/**
 * How many requests a batch keeps in flight. One page of offerings can be a
 * hundred rows, and an export is a heavy request each; a small pool keeps the
 * API responsive without making the user wait for one call after another.
 */
const BATCH_CONCURRENCY = 5;

/**
 * Runs `run` for every offering, never stopping at a failure, and reports
 * which offerings succeeded and which failed with what error, in input order.
 */
export const runOfferingBatch = async <T extends BulkOffering, R = unknown>(
  offerings: T[],
  run: (offering: T) => Promise<R>,
  concurrency = BATCH_CONCURRENCY,
): Promise<OfferingBatchResult<T> & { values: Map<T, R> }> => {
  const outcomes: Array<{ ok: boolean; value?: R; error?: unknown }> =
    new Array(offerings.length);
  let next = 0;
  const worker = async () => {
    while (next < offerings.length) {
      const index = next++;
      try {
        outcomes[index] = { ok: true, value: await run(offerings[index]) };
      } catch (error) {
        outcomes[index] = { ok: false, error };
      }
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.min(Math.max(concurrency, 1), offerings.length) },
      worker,
    ),
  );

  const succeeded: T[] = [];
  const failed: OfferingFailure<T>[] = [];
  const values = new Map<T, R>();
  outcomes.forEach((outcome, index) => {
    const offering = offerings[index];
    if (outcome.ok) {
      succeeded.push(offering);
      values.set(offering, outcome.value);
    } else {
      failed.push({ offering, error: outcome.error });
    }
  });
  return { succeeded, failed, values };
};

export type OfferingStateActionKey =
  | 'activate'
  | 'pause'
  | 'unpause'
  | 'make_unavailable'
  | 'make_available'
  | 'archive'
  | 'draft';

interface StateActionRule {
  /** The permission the backend checks for this transition. */
  permission: string;
  /** The offering states this transition leaves, as the menu offers it. */
  isSource(state: string): boolean;
}

/**
 * The transitions the backend allows, narrowed to the ones each offering's own
 * menu offers: activation from draft (an unavailable offering is restored and
 * a paused one resumed by their own actions), and so on.
 */
const STATE_ACTION_RULES: Record<OfferingStateActionKey, StateActionRule> = {
  activate: {
    permission: PermissionEnum.CREATE_OFFERING,
    isSource: (state) => state === DRAFT,
  },
  pause: {
    permission: PermissionEnum.PAUSE_OFFERING,
    isSource: (state) => state === ACTIVE,
  },
  unpause: {
    permission: PermissionEnum.UNPAUSE_OFFERING,
    isSource: (state) => state === PAUSED,
  },
  make_unavailable: {
    permission: PermissionEnum.PAUSE_OFFERING,
    isSource: (state) => state === ACTIVE,
  },
  make_available: {
    permission: PermissionEnum.PAUSE_OFFERING,
    isSource: (state) => state === UNAVAILABLE,
  },
  archive: {
    permission: PermissionEnum.ARCHIVE_OFFERING,
    isSource: (state) => state !== ARCHIVED,
  },
  draft: {
    permission: PermissionEnum.CREATE_OFFERING,
    isSource: (state) => state !== DRAFT,
  },
};

/**
 * Whether the user may move offerings through their lifecycle at all: staff
 * always, service providers only where the deployment allows it. Without it
 * the backend refuses every state change and deletion.
 */
export const canManageOfferingLifecycle = (
  user: Pick<User, 'is_staff'> | null | undefined,
) =>
  !!user?.is_staff ||
  !!ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT;

/** The offerings the user holds `permission` on, through their organization. */
export const filterPermitted = <T extends BulkOffering>(
  user: User,
  offerings: T[],
  permission: string,
): T[] =>
  offerings.filter((offering) =>
    hasPermission(user, { permission, customerId: offering.customer_uuid }),
  );

export interface StateActionTargets<T extends BulkOffering> {
  /** Offerings the user may change; empty hides the action. */
  permitted: T[];
  /** Of those, the ones in a state the transition leaves. */
  eligible: T[];
}

export const getStateActionTargets = <T extends BulkOffering>(
  user: User,
  offerings: T[],
  key: OfferingStateActionKey,
): StateActionTargets<T> => {
  const rule = STATE_ACTION_RULES[key];
  const permitted = canManageOfferingLifecycle(user)
    ? filterPermitted(user, offerings, rule.permission)
    : [];
  return {
    permitted,
    eligible: permitted.filter((offering) => rule.isSource(offering.state)),
  };
};

/** The organization all offerings belong to, or null when they span several. */
export const getSharedCustomerUuid = (offerings: BulkOffering[]) => {
  const customers = new Set(
    offerings.map((offering) => offering.customer_uuid),
  );
  return customers.size === 1 ? [...customers][0] : null;
};
