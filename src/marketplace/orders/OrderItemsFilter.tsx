import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { getCustomer, getWorkspace } from '@waldur/workspace/selectors';

import { OrderStateFilter } from './OrderStateFilter';
import { OrganizationAutocomplete } from './OrganizationAutocomplete';
import { ProviderAutocomplete } from './ProviderAutocomplete';

interface OwnProps {
  showOfferingFilter?: boolean;
  showOrganizationFilter?: boolean;
  showProviderFilter?: boolean;
}

interface StateProps {
  offeringFilter: object;
}

const PureOrderItemsFilter = (props: OwnProps & StateProps) => (
  <Row>
    {props.showOfferingFilter && (
      <OfferingAutocomplete offeringFilter={props.offeringFilter}/>
    )}
    {props.showOrganizationFilter && (
      <OrganizationAutocomplete/>
    )}
    {props.showProviderFilter && (
      <ProviderAutocomplete/>
    )}
    <OrderStateFilter/>
  </Row>
);

const filterSelector = createSelector(
  getCustomer,
  getWorkspace,
  (customer, workspace) => {
    if (workspace === 'organization') {
      return {customer_uuid: customer.uuid};
    }
  }
);

const mapStateToProps = state => ({
  offeringFilter: filterSelector(state),
});

const enhance = compose(
  reduxForm<{}, OwnProps>({form: 'OrderItemFilter'}),
  connect<StateProps, {}, OwnProps>(mapStateToProps),
);

export const OrderItemsFilter = enhance(PureOrderItemsFilter) as React.ComponentType<OwnProps>;
