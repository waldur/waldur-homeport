import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { PUBLIC_RESOURCES_LIST_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { RootState } from '@waldur/store/reducers';
import {
  getCustomer,
  getUser,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

type StateProps = ReturnType<typeof mapStateToProps>;

const PurePublicResourcesFilter: FunctionComponent<StateProps> = (props) => (
  <Row>
    <OfferingAutocomplete offeringFilter={props.offeringFilter} />
    <OrganizationAutocomplete />
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

const filterSelector = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  (customer, user, isServiceManager) =>
    isServiceManager
      ? { customer_uuid: customer.uuid, service_manager_uuid: user.uuid }
      : {
          customer_uuid: customer.uuid,
        },
);

const mapStateToProps = (state: RootState) => ({
  offeringFilter: filterSelector(state),
  initialValues: getInitialValues({
    state: getStates()[1],
  }),
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: PUBLIC_RESOURCES_LIST_FILTER_FORM_ID,
    onChange: syncFiltersToURL,
  }),
);

export const PublicResourcesFilter = enhance(PurePublicResourcesFilter);
