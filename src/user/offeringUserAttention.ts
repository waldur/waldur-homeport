import {
  marketplaceOfferingUsersList,
  OfferingUser,
  OfferingUserFieldEnum,
  OfferingUserState,
  RuntimeStateEnum,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';

const ATTENTION_REQUIRED_ACCOUNT_STATES: OfferingUserState[] = [
  'Pending account linking',
  'Pending additional validation',
];

const ATTENTION_REQUIRED_RUNTIME_STATES: RuntimeStateEnum[] = [
  'Pending account linking',
  'Pending additional validation',
];

type OfferingUsersListQuery = NonNullable<
  Parameters<typeof marketplaceOfferingUsersList>[0]
>['query'];

const PAGE_SIZE = 50;

export const mergeOfferingUsersByUuid = <T extends { uuid?: string }>(
  users: T[],
): T[] => {
  const byUuid = new Map<string, T>();
  users.forEach((user) => {
    if (user.uuid) {
      byUuid.set(user.uuid, user);
    }
  });
  return Array.from(byUuid.values());
};

const fetchOfferingUsers = (
  query: Omit<OfferingUsersListQuery, 'page' | 'page_size'>,
  signal?: AbortSignal,
) =>
  getAllPages((page) =>
    marketplaceOfferingUsersList({
      query: {
        ...query,
        page,
        page_size: PAGE_SIZE,
      },
      signal,
    }),
  );

export const fetchAttentionRequiredOfferingUsers = async ({
  userUuid,
  field,
  signal,
}: {
  userUuid: string;
  field: OfferingUserFieldEnum[];
  signal?: AbortSignal;
}): Promise<OfferingUser[]> => {
  const [byAccountState, byRuntimeState] = await Promise.all([
    fetchOfferingUsers(
      {
        user_uuid: userUuid,
        field,
        state: ATTENTION_REQUIRED_ACCOUNT_STATES,
      },
      signal,
    ),
    fetchOfferingUsers(
      {
        user_uuid: userUuid,
        field,
        runtime_state: ATTENTION_REQUIRED_RUNTIME_STATES,
      },
      signal,
    ),
  ]);

  return mergeOfferingUsersByUuid([...byAccountState, ...byRuntimeState]);
};
