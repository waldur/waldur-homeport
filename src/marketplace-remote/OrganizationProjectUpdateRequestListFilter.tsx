import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const Filter = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
      ellipsis={false}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
    <TableFilterItem title={translate('State')} name="state">
      <RequestStateFilter />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'OrganizationProjectUpdateRequestListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
  destroyOnUnmount: false,
});

export const OrganizationProjectUpdateRequestListFilter = enhance(Filter);
