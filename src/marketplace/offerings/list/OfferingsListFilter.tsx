import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
import { OfferingTypeFilter } from '@/marketplace/offerings/details/OfferingTypeFilter';
import { OfferingStateFilter } from '@/marketplace/offerings/list/OfferingStateFilter';
import { ProviderFilter } from '@/marketplace/orders/ProviderFilter';
import { CategoryFilter } from '@/marketplace/resources/list/CategoryFilter';
import { TagFilter } from '@/marketplace/tags/TagFilter';
import { SelectFilter } from '@/table';
import { facetOption } from '@/table/facets';

interface OfferingsListFilterOwnProps {
  showCategory?;
  showOrganization?;
}

// Store the provider's organization as {uuid, name}, the shape the
// Organization column's inline filter and the offering breadcrumb's URL
// already use, so the value survives the URL's "uuid::name" round trip.
const loadOrganizationOptions = async (query, prevOptions, additional) => {
  const result = await providerAutocomplete(query, prevOptions, additional);
  return {
    ...result,
    options: result.options.map((provider) => ({
      uuid: provider.customer_uuid,
      name: provider.customer_name,
    })),
  };
};

const sharedOptions = [
  {
    label: translate('No'),
    value: false,
  },
  {
    label: translate('Yes'),
    value: true,
  },
];

const organizationOption = facetOption('uuid', 'name');
const categoryOption = facetOption('uuid', 'title');
const tagOption = facetOption('uuid', 'name');

// The facet props limit each filter to values that still have offerings when
// the table passes `facets` to useTable; otherwise they change nothing.
export const OfferingsListFilter: FunctionComponent<
  OfferingsListFilterOwnProps
> = ({ showCategory, showOrganization = true }) => {
  return (
    <>
      <OfferingStateFilter instantApply={false} facet="state" />
      {showOrganization ? (
        <ProviderFilter
          name="organization"
          loadOptions={loadOrganizationOptions}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          facet="customer"
          facetOption={organizationOption}
        />
      ) : null}
      <OfferingTypeFilter facet="type" />
      {showCategory ? (
        <CategoryFilter facet="category" facetOption={categoryOption} />
      ) : null}
      <TagFilter facet="tag" facetOption={tagOption} />
      <SelectFilter
        name="shared"
        title={translate('Shared')}
        badgeValue={(value) => value?.label}
        placeholder={translate('Select status')}
        options={sharedOptions}
        facet="shared"
      />
    </>
  );
};
