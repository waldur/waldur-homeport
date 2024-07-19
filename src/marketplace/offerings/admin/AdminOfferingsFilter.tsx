import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

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

const PureAdminOfferingsFilter: FunctionComponent<
  AdminOfferingsFilterOwnProps
> = ({ showCategory, showOrganization = true }) => (
  <>
    <TableFilterItem title={translate('State')} name="state">
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
  </>
);

const enhance = reduxForm<{}, AdminOfferingsFilterOwnProps>({
  form: ADMIN_OFFERINGS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const AdminOfferingsFilter = enhance(PureAdminOfferingsFilter);
