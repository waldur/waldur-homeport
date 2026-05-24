import {
  callManagingOrganisationsList,
  customersList,
  marketplacePublicOfferingsList,
  marketplaceResourceProjectsList,
  marketplaceResourcesList,
  marketplaceServiceProvidersList,
  projectsList,
  proposalProposalsList,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { createLoadOptions, AsyncSelectLoader } from '@/form/select';

/**
 * Maps a TYPE_MAP key (as returned by personalAccessTokensAvailableBindingTargets)
 * to the SDK list function for entities of that type. Keys must match the
 * backend's `permissions.enums.TYPE_MAP`.
 */
export const ENTITY_LOADERS: Record<string, AsyncSelectLoader<any>> = {
  customer: createLoadOptions(customersList, 'query'),
  project: createLoadOptions(projectsList, 'query'),
  offering: createLoadOptions(marketplacePublicOfferingsList, 'query'),
  resource: createLoadOptions(marketplaceResourcesList, 'query'),
  resource_project: createLoadOptions(marketplaceResourceProjectsList, 'name'),
  service_provider: createLoadOptions(marketplaceServiceProvidersList, 'none'),
  call: createLoadOptions(proposalPublicCallsList, 'name'),
  proposal: createLoadOptions(proposalProposalsList, 'name'),
  call_organizer: createLoadOptions(callManagingOrganisationsList, 'none'),
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
