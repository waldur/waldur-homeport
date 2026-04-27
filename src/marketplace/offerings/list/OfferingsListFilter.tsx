import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { syncFiltersToURL, useReinitializeFilterFromUrl } from '@/core/filters';
import { SelectField } from '@/form';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { OfferingTypeAutocomplete } from '@/marketplace/offerings/details/OfferingTypeAutocomplete';
import { OfferingStateFilter } from '@/marketplace/offerings/list/OfferingStateFilter';
import { ServiceProviderAutocomplete } from '@/marketplace/offerings/ServiceProviderAutocomplete';
import { CategoryFilter } from '@/marketplace/resources/list/CategoryFilter';
import { TagFilter } from '@/marketplace/tags/TagFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

import { OFFERINGS_FILTER_FORM_ID } from '../constants';

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

const PureOfferingsListFilter: FunctionComponent<
  OfferingsListFilterOwnProps
> = ({ showCategory, showOrganization = true }) => {
  useReinitializeFilterFromUrl(OFFERINGS_FILTER_FORM_ID);
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
        getValueLabel={(value) =>
          sharedOptions.find((op) => op.value === value).label
        }
      >
        <Field
          name="shared"
          component={(fieldProps) => (
            <SelectField
              {...fieldProps}
              placeholder={translate('Select status')}
              options={sharedOptions}
              noUpdateOnBlur={true}
              simpleValue={true}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm<{}, OfferingsListFilterOwnProps>({
  form: OFFERINGS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
});

export const OfferingsListFilter = enhance(PureOfferingsListFilter);
