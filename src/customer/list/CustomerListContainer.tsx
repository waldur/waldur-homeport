import * as moment from 'moment-timezone';
import * as React from 'react';

import { getList } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';

import { getOptions } from './AccountingRunningField';
import { CustomerList } from './CustomerList';
import { CustomerListFilter } from './CustomerListFilter';
import { TotalCostContainer } from './TotalCostComponent';

const makeAccountingPeriods = (start: moment.Moment) => {
  let date = moment().startOf('month');
  const diff = date.diff(start, 'months');
  const choices = [];
  for (let i = 0; i <= diff; i++) {
    const month = date.month() + 1;
    const year = date.year();
    const label = date.format('MMMM, YYYY');
    choices.push({
      label,
      value: { year, month, current: i === 0 },
    });
    date = date.subtract(1, 'month');
  }
  return choices;
};

interface Invoice {
  year: number;
  month: number;
}

const getInvoices = params => getList<Invoice>('/invoices/', params);

async function oldestInvoice() {
  const params = {
    page_size: 1,
    o: ['year', 'month'],
    field: ['year', 'month'],
  };
  const response = await getInvoices(params);
  if (response.length === 1) {
    const invoice = response[0];
    return moment({ year: invoice.year, month: invoice.month - 1 });
  } else {
    return moment().startOf('month');
  }
}

async function loadData() {
  const start = await oldestInvoice();
  const accountingPeriods = makeAccountingPeriods(start);
  const initialValues = {
    accounting_period: accountingPeriods[0],
    accounting_is_running: getOptions()[0],
  };
  return { initialValues, accountingPeriods };
}

export const CustomerListContainer = () => (
  <Query loader={loadData}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner />;
      }
      if (error) {
        return <span>{translate('Unable to load financial overview.')}</span>;
      }
      return (
        <>
          <CustomerListFilter {...data} />
          <div className="ibox-content">
            <CustomerList />
            <TotalCostContainer />
          </div>
        </>
      );
    }}
  </Query>
);
