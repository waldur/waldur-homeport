import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import {
  providerOfferingsAutocomplete,
  publicOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';
import { Option, SingleValue } from '@/marketplace/landing/AutocompleteField';
import { AsyncSelectFilter } from '@/table';
import { facetOption, useHasTableFacets } from '@/table/facets';

interface OfferingFilterProps {
  offeringFilter?: object;
  providerOfferings?: boolean;
  [key: string]: any;
}

// An offering picked from a facet carries its name but no category.
const offeringLabel = (offering) =>
  offering?.category_title
    ? `${offering.category_title} / ${offering.name}`
    : offering?.name;

const offeringFacetOption = facetOption('uuid', 'name');

export const OfferingFilter: FC<OfferingFilterProps> = ({
  providerOfferings = true,
  offeringFilter,
  ...props
}) => {
  const loadOptions = useMemo(
    () =>
      (providerOfferings
        ? providerOfferingsAutocomplete
        : publicOfferingsAutocomplete)(offeringFilter),
    [providerOfferings, offeringFilter],
  );
  // Counted only on a table with facets; elsewhere the thumbnails stay.
  const counted = useHasTableFacets() && !!props.facet;

  return (
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      badgeValue={offeringLabel}
      placeholder={translate('Select offering...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={offeringLabel}
      // The thumbnail options draw their own label, which has no count.
      components={counted ? undefined : { Option, SingleValue }}
      facetOption={offeringFacetOption}
      {...props}
    />
  );
};
