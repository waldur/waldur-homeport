import { OfferingUser } from 'waldur-js-client';

import { createClientPaginatedFetcher } from '@/table/api';
import { Fetcher } from '@/table/types';
import { fetchAttentionRequiredOfferingUsers } from '@/user/offeringUserAttention';

export const createAttentionOfferingUsersFetcher = (
  userUuid: string,
): Fetcher<OfferingUser> => {
  return async (request) => {
    const rows = await fetchAttentionRequiredOfferingUsers({
      userUuid,
      field: [
        'uuid',
        'offering_name',
        'username',
        'created',
        'state',
        'has_consent',
        'user_uuid',
        'offering_uuid',
        'service_provider_comment',
        'service_provider_comment_url',
        'is_profile_complete',
        'missing_profile_attributes',
      ],
      signal: request.options?.signal,
    });

    return createClientPaginatedFetcher(rows)(request);
  };
};
