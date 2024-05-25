import React from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID } from '@waldur/marketplace/orders/list/constants';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ProviderAutocomplete } from '../ProviderAutocomplete';
import { OrderState } from '../types';

import { OrderStateFilter } from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

const getOrderStateFilterOptions = (): {
  value: OrderState;
  label: string;
}[] => [
  { value: 'executing', label: translate('Executing') },
  {
    value: 'pending-consumer',
    label: translate('Pending consumer approval'),
  },
  {
    value: 'pending-provider',
    label: translate('Pending provider approval'),
  },
  { value: 'done', label: translate('Done') },
  { value: 'erred', label: translate('Erred') },
  { value: 'canceled', label: translate('Canceled') },
  { value: 'rejected', label: translate('Rejected') },
];

const PureMarketplaceOrdersListFilter = () => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
    >
      <OfferingAutocomplete />
    </TableFilterItem>
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
      title={translate('Service provider')}
      name="provider"
      getValueLabel={(option) => option.customer_name}
    >
      <ProviderAutocomplete />
    </TableFilterItem>
    <TableFilterItem
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <OrderStateFilter options={getOrderStateFilterOptions} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Type')}
      name="type"
      badgeValue={(value) => value?.label}
      ellipsis={true}
    >
      <OrderTypeFilter />
    </TableFilterItem>
  </>
);

export const MarketplaceOrdersListFilter = reduxForm({
  form: MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID,
  initialValues: {
    state: getOrderStateFilterOptions()[0],
  },
  destroyOnUnmount: false,
})(PureMarketplaceOrdersListFilter) as React.ComponentType;
