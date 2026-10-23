import {
  marketplaceProviderOfferingsList,
  proposalProtectedCallsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';
import { ENTITY_LOADERS } from '@/user/personal-access-tokens/entityFetchers';

/**
 * Scope pickers for granting a role.
 *
 * Token binding keeps the public offering and call lists in ENTITY_LOADERS.
 * A grant rejects an offering that is not shared, and the public call list
 * hides drafts, which is when call managers and reviewers are assigned.
 * Provider offerings here are shared ones in any state. Protected calls
 * include drafts.
 */
export const grantScopeLoaders = {
  ...ENTITY_LOADERS,
  offering: createLoadOptions(marketplaceProviderOfferingsList, 'name', {
    shared: true,
    // The dialog reads the id, the label, and the owning organization.
    // A full offering record is much larger than that.
    field: ['uuid', 'name', 'customer_uuid', 'customer_name'],
  }),
  call: createLoadOptions(proposalProtectedCallsList, 'name'),
};
