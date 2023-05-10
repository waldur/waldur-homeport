import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { PUBLIC_RESOURCES_LIST_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { RelatedCustomerFilter } from './RelatedCustomerFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

const getFiltersFromParams = (params) => {
  if (!params?.state) return params;
  return {
    ...params,
    state: getStates().filter((state) => params.state.includes(state.value)),
  };
};

type StateProps = ReturnType<typeof mapStateToProps>;

const PurePublicResourcesFilter: FunctionComponent<StateProps> = (props) => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
    >
      <OfferingAutocomplete offeringFilter={props.offeringFilter} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Client organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <RelatedCustomerFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Category')}
      name="category"
      badgeValue={(value) => value?.title}
    >
      <CategoryFilter />
    </TableFilterItem>
    <TableFilterItem title={translate('State')} name="state">
      <ResourceStateFilter reactSelectProps={{ isMulti: true }} />
    </TableFilterItem>
  </>
);

const filterSelector = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  isOwnerOrStaffSelector,
  (customer, user, isServiceManager, isOwnerOrStaff) =>
    isServiceManager && !isOwnerOrStaff
      ? { customer_uuid: customer.uuid, service_manager_uuid: user.uuid }
      : {
          customer_uuid: customer.uuid,
        },
);

const mapStateToProps = (state: RootState) => ({
  offeringFilter: filterSelector(state),
  initialValues: getFiltersFromParams(
    getInitialValues({
      state: [getStates()[1]],
    }),
  ),
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: PUBLIC_RESOURCES_LIST_FILTER_FORM_ID,
    onChange: syncFiltersToURL,
    destroyOnUnmount: false,
  }),
);

export const PublicResourcesFilter = enhance(PurePublicResourcesFilter);
