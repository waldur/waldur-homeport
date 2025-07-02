import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { SelectField } from '@waldur/form';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingTypeAutocomplete } from '@waldur/marketplace/offerings/details/OfferingTypeAutocomplete';
import { OfferingStateFilter } from '@waldur/marketplace/offerings/list/OfferingStateFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { CategoryFilter } from '@waldur/marketplace/resources/list/CategoryFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ADMIN_OFFERINGS_FILTER_FORM_ID } from './constants';

interface AdminOfferingsFilterOwnProps {
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

const PureAdminOfferingsFilter: FunctionComponent<
  AdminOfferingsFilterOwnProps
> = ({ showCategory, showOrganization = true }) => (
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
        <OrganizationAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
    ) : null}
    <TableFilterItem
      title={translate('Integration type')}
      name="offering_type"
      badgeValue={(value) => value?.label}
    >
      <OfferingTypeAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
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

const enhance = reduxForm<{}, AdminOfferingsFilterOwnProps>({
  form: ADMIN_OFFERINGS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const AdminOfferingsFilter = enhance(PureAdminOfferingsFilter);
