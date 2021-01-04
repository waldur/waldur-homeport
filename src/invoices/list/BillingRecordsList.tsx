import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { formatPeriod } from '../utils';

import { InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const RecordPeriodField = ({ row }) => formatPeriod(row);

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Record number'),
          render: ({ row }) => (
            <Link state="billingDetails" params={{ uuid: row.uuid }}>
              {row.number}
            </Link>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Record period'),
          render: RecordPeriodField,
        },
        {
          title: (
            <>
              <PriceTooltip /> {translate('Total')}
            </>
          ),
          render: ({ row }) => defaultCurrency(row.price),
        },
        {
          title: translate('Actions'),
          render: SendNotificationButton,
        },
      ]}
      verboseName={translate('records')}
    />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  customer: props.customer.url,
});

const TableOptions: TableOptionsType = {
  table: 'invoices',
  fetchData: createFetcher('invoices'),
  mapPropsToFilter,
  queryField: 'number',
};

const mapsStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  stateFilter: getFormValues('InvoicesFilter')(state),
});

const enhance = compose(connect(mapsStateToProps), connectTable(TableOptions));

const BillingRecordsListComponent = enhance(TableComponent);

export const BillingRecordsList: FunctionComponent = () => (
  <>
    <InvoicesFilter />
    <BillingRecordsListComponent />
  </>
);
