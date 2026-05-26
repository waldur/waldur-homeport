import {
  affiliatedOrganizationsList,
  AffiliatedOrganizationsListData,
  customersList,
  CustomersListData,
  marketplaceCategoriesList,
  MarketplaceCategoriesListData,
  marketplaceOfferingGroupsList,
  MarketplaceOfferingGroupsListData,
  marketplaceProviderOfferingsList,
  MarketplaceProviderOfferingsListData,
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
  marketplaceResourceOfferingsList,
  MarketplaceResourceOfferingsListData,
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  marketplaceServiceProvidersList,
  marketplaceTagsList,
  projectsList,
  ProjectsListData,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';

export const organizationAutocomplete = (
  extraQueryParams?: CustomersListData['query'],
) => createLoadOptions(customersList, 'query', extraQueryParams);

export const projectAutocomplete = (
  customer?: string,
  extraParams: ProjectsListData['query'] = {},
) => {
  const extra = customer
    ? { customer: [customer], ...extraParams }
    : extraParams;
  return createLoadOptions(projectsList, 'name', {
    field: ['name', 'uuid', 'url', 'is_industry', 'customer_uuid'],
    o: ['name'],
    ...extra,
  });
};

export const moveToProjectAutocomplete = createLoadOptions(
  projectsList,
  'name',
  {
    field: ['name', 'url', 'customer_name'],
    o: ['customer_name'],
  },
);

export const providerAutocomplete = createLoadOptions(
  marketplaceServiceProvidersList,
  'customer_keyword',
  {
    field: ['customer_name', 'customer_uuid', 'url', 'uuid'],
    o: ['customer_name'],
  },
);

export const categoryAutocomplete = (
  extraParams?: MarketplaceCategoriesListData['query'],
) =>
  createLoadOptions(marketplaceCategoriesList, 'title', {
    field: ['title', 'uuid', 'url'],
    ...extraParams,
  });

export const OfferingsAutocompleteCommonFields = [
  'name',
  'uuid',
  'url',
  'category_title',
  'thumbnail',
  'customer_name',
  'customer_uuid',
] as MarketplaceProviderOfferingsListData['query']['field'] &
  MarketplacePublicOfferingsListData['query']['field'];

export const providerOfferingsAutocomplete = (
  extraQuery?: MarketplaceProviderOfferingsListData['query'],
) =>
  createLoadOptions(marketplaceProviderOfferingsList, 'name', {
    field: OfferingsAutocompleteCommonFields,
    o: ['name'],
    state: ['Active'],
    ...extraQuery,
  });

export const publicOfferingsAutocomplete = (
  extraQuery?: MarketplacePublicOfferingsListData['query'] &
    MarketplaceProviderOfferingsListData['query'],
) =>
  createLoadOptions(marketplacePublicOfferingsList, 'name', {
    field: OfferingsAutocompleteCommonFields,
    o: ['name'],
    state: ['Active'],
    ...extraQuery,
  });

export const userAutocomplete = createLoadOptions(usersList, 'full_name', {
  field: ['full_name', 'url', 'username', 'email', 'uuid'],
  o: ['full_name'],
});

export const resourceOfferingsAutocomplete = (
  category_uuid: string,
  extraQuery?: MarketplaceResourceOfferingsListData['query'],
) =>
  createLoadOptions(marketplaceResourceOfferingsList, 'name', extraQuery, {
    category_uuid,
  });

export const resourceAutocomplete = (
  extraQuery?: MarketplaceResourcesListData['query'],
) => createLoadOptions(marketplaceResourcesList, 'name', extraQuery);

export const affiliationAutocomplete = (
  extraParams?: AffiliatedOrganizationsListData['query'],
) =>
  createLoadOptions(affiliatedOrganizationsList, 'query', {
    o: 'name',
    ...extraParams,
  });

export const tagAutocomplete = createLoadOptions(marketplaceTagsList, 'name');

export const offeringGroupAutocomplete = (
  extraParams?: MarketplaceOfferingGroupsListData['query'],
) => createLoadOptions(marketplaceOfferingGroupsList, 'title', extraParams);
