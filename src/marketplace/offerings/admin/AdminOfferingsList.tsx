import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { RootState } from '@waldur/store/reducers';
import { connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { TableComponent, TableOptions } from '../list/OfferingsList';

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

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues(ADMIN_OFFERINGS_FILTER_FORM_ID)(state),
  hasOrganizationColumn: true,
});

const enhance = compose(connect(mapStateToProps), connectTable(Options));

export const AdminOfferingsList = enhance(
  TableComponent,
) as React.ComponentType<any>;
