import {
  marketplaceProviderResourcesFacetsList,
  marketplaceResourcesFacetsList,
} from 'waldur-js-client';

// What each resource filter can still take; see `facets` in useTable. Stable
// objects, as they are part of the facet queries' keys.
export const resourceFacets = { fetch: marketplaceResourcesFacetsList };

export const providerResourceFacets = {
  fetch: marketplaceProviderResourcesFacetsList,
};
