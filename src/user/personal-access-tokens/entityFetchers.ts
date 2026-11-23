import {
  BindableEntity,
  BindableEntityTypeEnum,
  personalAccessTokensAvailableBindingEntitiesList,
} from 'waldur-js-client';

import { AsyncSelectLoader } from '@/form/select';

/**
 * Loads the entities of one type a token can be restricted to: those the
 * user holds a permission on (or under), the same check the create endpoint
 * makes. The endpoint returns its best matches unpaginated, so a search
 * narrows them and there is never a next page.
 */
export const createBindableEntityLoader =
  (type: string): AsyncSelectLoader<BindableEntity> =>
  async (query) => {
    const response = await personalAccessTokensAvailableBindingEntitiesList({
      query: {
        type: type as BindableEntityTypeEnum,
        ...(query ? { query } : {}),
      },
    });
    return { options: response.data ?? [], hasMore: false };
  };

const TYPE_LABELS: Record<string, string> = {
  customer: 'Organization',
  project: 'Project',
  offering: 'Offering',
  resource: 'Resource',
  resource_project: 'Resource project',
  service_provider: 'Service provider',
  call: 'Call',
  proposal: 'Proposal',
  call_organizer: 'Call-managing organisation',
};

export const labelForType = (type: string): string => TYPE_LABELS[type] ?? type;
