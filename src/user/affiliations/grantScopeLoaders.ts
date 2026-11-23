import {
  callManagingOrganisationsList,
  customersList,
  marketplaceProviderOfferingsList,
  marketplaceResourceProjectsList,
  marketplaceResourcesList,
  marketplaceServiceProvidersList,
  projectsList,
  proposalProposalsList,
  proposalProtectedCallsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

/**
 * Scope pickers for granting a role.
 *
 * Keyed by the backend's TYPE_MAP key.
 * A grant rejects an offering that is not shared, and the public call list
 * hides drafts, which is when call managers and reviewers are assigned.
 * Provider offerings here are shared ones in any state. Protected calls
 * include drafts.
 */
export const grantScopeLoaders = {
  customer: createLoadOptions(customersList, 'query'),
  project: createLoadOptions(projectsList, 'query'),
  resource: createLoadOptions(marketplaceResourcesList, 'query'),
  resource_project: createLoadOptions(marketplaceResourceProjectsList, 'name'),
  service_provider: createLoadOptions(marketplaceServiceProvidersList, 'none'),
  proposal: createLoadOptions(proposalProposalsList, 'name'),
  call_organizer: createLoadOptions(callManagingOrganisationsList, 'none'),
  offering: createLoadOptions(marketplaceProviderOfferingsList, 'name', {
    shared: true,
    // The dialog reads the id, the label, and the owning organization.
    // A full offering record is much larger than that.
    field: ['uuid', 'name', 'customer_uuid', 'customer_name'],
  }),
  call: createLoadOptions(proposalProtectedCallsList, 'name'),
};
