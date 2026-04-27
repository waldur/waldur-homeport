import { reduxForm } from 'redux-form';

import { syncFiltersToURL } from '@/core/filters';
import { CUSTOMER_ORDERS_LIST_FILTER_FORM_ID } from '@/customer/constants';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { OFFERING_ORDERS_LIST_FILTER_FORM_ID } from '@/marketplace/details/constants';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID } from '@/marketplace/orders/list/constants';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { PROVIDER_ORDERS_LIST_FILTER_FORM_ID } from '@/marketplace/service-providers/constants';
import { TableFilterItem } from '@/table/TableFilterItem';

import { createOrderStateOptions } from '../OrderStates';
import { ProviderAutocomplete } from '../ProviderAutocomplete';

import { OrderStateFilter } from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

const PureMarketplaceOrdersListFilter = (props) => {
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
        <OrderStateFilter options={createOrderStateOptions} />
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
  destroyOnUnmount: false,
})((props) => (
  <PureMarketplaceOrdersListFilter {...props} hasOffering hasOrganization />
));

export const ProviderOrdersListFilter = reduxForm({
  form: PROVIDER_ORDERS_LIST_FILTER_FORM_ID,
  onChange: syncFiltersToURL,
  touchOnChange: true,
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
    state: createOrderStateOptions()[0],
  },
  destroyOnUnmount: false,
})((props) => <PureMarketplaceOrdersListFilter {...props} hasOrganization />);

export const CustomerOrdersListFilter = reduxForm({
  form: CUSTOMER_ORDERS_LIST_FILTER_FORM_ID,
  touchOnChange: true,
  destroyOnUnmount: false,
})((props) => <PureMarketplaceOrdersListFilter {...props} hasOffering />);
