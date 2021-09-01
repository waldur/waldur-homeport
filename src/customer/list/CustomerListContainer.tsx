import { useRouter } from '@uirouter/react';
import moment from 'moment-timezone';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { getList } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

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

const getInvoices = (params) => getList<Invoice>('/invoices/', params);

async function oldestInvoice() {
  const params = {
    page_size: 1,
    o: ['year', 'month'].join(','),
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

export const CustomerListContainer: FunctionComponent = () => {
  useTitle(translate('Financial overview'));
  useReportingBreadcrumbs();
  const { loading, error, value: data } = useAsync(loadData);
  const router = useRouter();
  if (!ENV.FEATURES.SUPPORT.CUSTOMERS_LIST) {
    router.stateService.go('errorPage.notFound');
  }

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load financial overview.')}</>;
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
};
