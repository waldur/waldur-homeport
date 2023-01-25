import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { approveCustomer, rejectCustomer } from './api';
import { CustomerCreateExpandableRow } from './CustomerCreateExpandableRow';
import { ReviewActions } from './ReviewActions';
import { flowFilterFormSelector, getColumns } from './utils';

export const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={getColumns()}
      verboseName={translate('requests')}
      showPageSizeSelector={true}
      hoverableRow={({ row }) => (
        <ReviewActions
          request={row}
          refetch={props.fetch}
          approveMethod={approveCustomer}
          rejectMethod={rejectCustomer}
        />
      )}
      expandableRow={CustomerCreateExpandableRow}
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'CustomerCreateRequestsList',
  fetchData: createFetcher('marketplace-customer-creation-requests'),
  mapPropsToFilter: (props) => ({
    state: props.filter?.state?.map((choice) => choice.value),
  }),
};

const mapStateToProps = (state: RootState) => ({
  filter: flowFilterFormSelector(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerCreateRequestsList = enhance(
  TableComponent,
) as React.ComponentType<any>;
