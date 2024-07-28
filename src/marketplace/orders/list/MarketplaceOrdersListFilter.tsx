import { reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { CUSTOMER_ORDERS_LIST_FILTER_FORM_ID } from '@waldur/customer/constants';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OFFERING_ORDERS_LIST_FILTER_FORM_ID } from '@waldur/marketplace/details/constants';
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

const PureMarketplaceOrdersListFilter = (props) => {
  useReinitializeFilterFromUrl(props.form, {
    state: getOrderStateFilterOptions()[0],
  });
  const { provider_uuid } = props;

  return (
    <>
      {props.hasOffering && (
        <TableFilterItem
          title={translate('Offering')}
          name="offering"
          badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
        >
          <OfferingAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
        </TableFilterItem>
      )}
      {props.hasOrganization && (
        <TableFilterItem
          title={translate('Organization')}
          name="organization"
          badgeValue={(value) => value?.name}
        >
          <OrganizationAutocomplete
            reactSelectProps={REACT_SELECT_TABLE_FILTER}
          />
        </TableFilterItem>
      )}
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
      {props.hasOrganization && !provider_uuid && (
        <TableFilterItem
          title={translate('Service provider')}
          name="provider"
          getValueLabel={(option) => option.customer_name}
        >
          <ProviderAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
        </TableFilterItem>
      )}
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
};

export const MarketplaceOrdersListFilter = reduxForm({
  form: MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID,
  onChange: syncFiltersToURL,
  touchOnChange: true,
  initialValues: {
    state: getOrderStateFilterOptions()[0],
  },
  destroyOnUnmount: false,
})((props) => (
  <PureMarketplaceOrdersListFilter {...props} hasOffering hasOrganization />
)) as React.ComponentType<{
  provider_uuid?: string;
}>;

export const OfferingOrdersListFilter = reduxForm({
  form: OFFERING_ORDERS_LIST_FILTER_FORM_ID,
  touchOnChange: true,
  initialValues: {
    state: getOrderStateFilterOptions()[0],
  },
  destroyOnUnmount: false,
})((props) => <PureMarketplaceOrdersListFilter {...props} hasOrganization />);

export const CustomerOrdersListFilter = reduxForm({
  form: CUSTOMER_ORDERS_LIST_FILTER_FORM_ID,
  touchOnChange: true,
  initialValues: {
    state: getOrderStateFilterOptions()[0],
  },
  destroyOnUnmount: false,
})((props) => <PureMarketplaceOrdersListFilter {...props} hasOffering />);
