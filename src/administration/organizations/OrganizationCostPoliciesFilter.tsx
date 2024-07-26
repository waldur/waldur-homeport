import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureOrganizationCostPoliciesFilter = () => (
  <TableFilterItem
    title={translate('Organization')}
    name="organization"
    badgeValue={(value) => value?.name}
  >
    <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: 'OrgCostPoliciesFilter',
  destroyOnUnmount: false,
});

export const OrganizationCostPoliciesFilter = enhance(
  PureOrganizationCostPoliciesFilter,
);
