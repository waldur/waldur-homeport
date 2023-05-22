import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';
import { connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff,
  isSupportOnly,
} from '@waldur/workspace/selectors';

import { TableComponent, TableOptions } from '../OfferingsList';

import {
  ADMIN_OFFERINGS_FILTER_FORM_ID,
  ADMIN_OFFERING_TABLE_NAME,
} from './constants';

const mapPropsToFilter = (props) => {
  const filter: Record<string, any> = {
    billable: true,
    shared: true,
  };
  if (props.filter?.organization) {
    filter.customer_uuid = props.filter.organization.uuid;
  }
  if (props.filter?.state) {
    filter.state = props.filter.state.map((option) => option.value);
  }
  if (props.filter?.offering_type) {
    filter.type = props.filter.offering_type.value;
  }
  return filter;
};

export const Options: TableOptionsType = {
  ...TableOptions,
  table: ADMIN_OFFERING_TABLE_NAME,
  mapPropsToFilter,
};

const showOfferingListActions = createSelector(
  isOwnerOrStaff,
  getCustomer,
  (ownerOrStaff, customer) =>
    customer && customer.is_service_provider && ownerOrStaff,
);

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  user: getUser(state),
  isOwnerOrStaff: isOwnerOrStaff(state),
  hideOfferingItemActions: isSupportOnly(state),
  showOfferingListActions: showOfferingListActions(state),
  actionsDisabled: !isOwnerOrStaff(state),
  filter: getFormValues(ADMIN_OFFERINGS_FILTER_FORM_ID)(state),
  hasOrganizationColumn: true,
});

const enhance = compose(connect(mapStateToProps), connectTable(Options));

export const AdminOfferingsList = enhance(
  TableComponent,
) as React.ComponentType<any>;
