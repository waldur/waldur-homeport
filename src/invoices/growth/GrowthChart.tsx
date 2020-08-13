import * as moment from 'moment-timezone';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getAllInvoices } from '@waldur/invoices/api';
import { getEChartOptions } from '@waldur/invoices/growth/utils';

export const GrowthChart = () => {
  const { loading, error, value: option } = useAsync(() => {
    const twelveMonthsAgo = moment().subtract(12, 'months');
    return getAllInvoices(twelveMonthsAgo.format('YYYY-MM')).then((invoices) =>
      getEChartOptions(invoices),
    );
  });
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load growth chart.')}</>;
  }
  return (
    <div className="ibox-content m-t-md p-m">
      <EChart options={option} height="400px" />
    </div>
  );
};
