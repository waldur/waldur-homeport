import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { getInitialValues } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer, getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import {
  OrderStateFilter,
  getOrderStateFilterOption,
} from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

const getFiltersFromParams = (params) => {
  if (!params?.state) return params;
  return {
    ...params,
    state: getOrderStateFilterOption().find(
      (state) => params.state === state.value,
    ),
  };
};

interface OwnProps {
  showOfferingFilter?: boolean;
  showOrganizationFilter?: boolean;
  showProviderFilter?: boolean;
  offeringFilter?: object;
}

interface StateProps {
  offeringFilter: object;
}

const PureOrderItemsFilter = (props: OwnProps & StateProps) => (
  <>
    {props.showOfferingFilter && (
      <TableFilterItem title={translate('Offering')} name="offering">
        <OfferingAutocomplete offeringFilter={props.offeringFilter} />
      </TableFilterItem>
    )}
    {props.showOrganizationFilter && (
      <TableFilterItem title={translate('Organization')} name="organization">
        <OrganizationAutocomplete />
      </TableFilterItem>
    )}
    {props.showProviderFilter && (
      <TableFilterItem title={translate('Service provider')} name="provider">
        <ProviderAutocomplete />
      </TableFilterItem>
    )}
    <TableFilterItem
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
    >
      <OrderStateFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Type')}
      name="type"
      badgeValue={(value) => value?.label}
    >
      <OrderTypeFilter />
    </TableFilterItem>
  </>
);

const filterSelector = createSelector(
  getCustomer,
  getWorkspace,
  (customer, workspace) => {
    if (workspace === ORGANIZATION_WORKSPACE) {
      return { customer_uuid: customer.uuid };
    }
  },
);

const mapStateToProps = (state, ownProps) => ({
  offeringFilter: { ...ownProps.offeringFilter, ...filterSelector(state) },
  initialValues: getFiltersFromParams(getInitialValues()),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  reduxForm<{}, OwnProps>({ form: 'OrderItemFilter', destroyOnUnmount: false }),
);

export const OrderItemsFilter = enhance(
  PureOrderItemsFilter,
) as React.ComponentType<OwnProps>;
