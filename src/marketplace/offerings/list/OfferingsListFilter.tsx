import { FunctionComponent } from 'react';
import { Field as FinalField } from 'react-final-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { OfferingTypeAutocomplete } from '@/marketplace/offerings/details/OfferingTypeAutocomplete';
import { OfferingStateFilter } from '@/marketplace/offerings/list/OfferingStateFilter';
import { ServiceProviderAutocomplete } from '@/marketplace/offerings/ServiceProviderAutocomplete';
import { CategoryFilter } from '@/marketplace/resources/list/CategoryFilter';
import { TagFilter } from '@/marketplace/tags/TagFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

interface OfferingsListFilterOwnProps {
  showCategory?;
  showOrganization?;
}

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

export const OfferingsListFilter: FunctionComponent<
  OfferingsListFilterOwnProps
> = ({ showCategory, showOrganization = true }) => {
  return (
    <>
      <TableFilterItem
        title={translate('State')}
        name="state"
        instantApply={false}
      >
        <OfferingStateFilter />
      </TableFilterItem>
      {showOrganization ? (
        <TableFilterItem
          title={translate('Organization')}
          name="organization"
          badgeValue={(value) => value?.name}
        >
          <ServiceProviderAutocomplete
            reactSelectProps={REACT_SELECT_TABLE_FILTER}
          />
        </TableFilterItem>
      ) : null}
      <TableFilterItem
        title={translate('Integration type')}
        name="offering_type"
        badgeValue={(value) => value?.label}
      >
        <OfferingTypeAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      {showCategory ? (
        <TableFilterItem
          title={translate('Category')}
          name="category"
          badgeValue={(value) => value?.title}
        >
          <CategoryFilter />
        </TableFilterItem>
      ) : null}
      <TableFilterItem
        title={translate('Tag')}
        name="tag"
        badgeValue={(value) => value?.name}
      >
        <TagFilter />
      </TableFilterItem>
      <TableFilterItem
        name="shared"
        title={translate('Shared')}
        badgeValue={(value) => value?.label}
      >
        <FinalField
          name="shared"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select status')}
              options={sharedOptions}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};
