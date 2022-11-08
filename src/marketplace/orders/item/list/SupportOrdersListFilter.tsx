import React from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';
import { SUPPORT_ORDERS_LIST_FILTER_FORM_ID } from '@waldur/marketplace/orders/item/list/constants';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { OrderStateFilter } from './OrderStateFilter';

const getOrderStateFilterOptions = (): Option[] => [
  { value: 'executing', label: translate('Executing') },
  {
    value: 'requested for approval',
    label: translate('Requested for approval'),
  },
  { value: 'done', label: translate('Done') },
  { value: 'erred', label: translate('Erred') },
  { value: 'terminated', label: translate('Terminated') },
  { value: 'rejected', label: translate('Rejected') },
];

const PureSupportOrdersListFilter = () => (
  <TableFilterFormContainer form={SUPPORT_ORDERS_LIST_FILTER_FORM_ID}>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
    >
      <ProjectFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <OrderStateFilter options={getOrderStateFilterOptions} />
    </TableFilterItem>
  </TableFilterFormContainer>
);

export const SupportOrdersListFilter = reduxForm({
  form: SUPPORT_ORDERS_LIST_FILTER_FORM_ID,
  initialValues: {
    state: getOrderStateFilterOptions()[0],
  },
  destroyOnUnmount: false,
})(PureSupportOrdersListFilter) as React.ComponentType;
