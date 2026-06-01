import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { OfferingTypeAutocomplete } from '@/marketplace/offerings/details/OfferingTypeAutocomplete';
import {
  OfferingStateFilter,
  getStates,
} from '@/marketplace/offerings/list/OfferingStateFilter';
import { TagFilter } from '@/marketplace/tags/TagFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

export const getFiltersFromParams = (params) => {
  if (!params?.state) {
    return {
      ...params,
      state: getStates().filter((state) => state.value !== 'Archived'),
    };
  }
  // params.state may be an array of plain strings (legacy / hand-crafted URL)
  // or an array of {value, label} option objects (syncFiltersToURL writes the
  // form's option objects into the URL as JSON). Normalize to a set of values
  // before matching against the canonical state choices.
  const stateValues = new Set(
    params.state.map((s) =>
      s !== null && typeof s === 'object' && 'value' in s ? s.value : s,
    ),
  );
  return {
    ...params,
    state: getStates().filter((state) => stateValues.has(state.value)),
  };
};

interface ProviderOfferingsFilterProps {
  offeringTypes?: Option[];
}

export const ProviderOfferingsFilter: FunctionComponent<
  ProviderOfferingsFilterProps
> = ({ offeringTypes }) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      instantApply={false}
    >
      <OfferingStateFilter />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Integration type ({count})', {
        count: offeringTypes?.length ?? 0,
      })}
      name="offering_type"
    >
      <OfferingTypeAutocomplete
        reactSelectProps={{ variant: 'tableFilter' }}
        options={offeringTypes}
      />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Tag')}
      name="tag"
      badgeValue={(value) => value?.name}
    >
      <TagFilter />
    </TableFilterItem>
  </>
);
