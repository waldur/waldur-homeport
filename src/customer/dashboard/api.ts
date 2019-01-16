import * as moment from 'moment-timezone';

import { getList } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import {
  getDailyQuotaCharts,
  padMissingValues,
  DateValuePair
} from '@waldur/dashboard/api';
import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { Scope, Chart } from '@waldur/dashboard/types';
import { translate } from '@waldur/i18n';

interface InvoiceSummary {
  year: number;
  month: number;
  price: number;
}

export const formatCostChart = (invoices: InvoiceSummary[], count): Chart => {
  let items: DateValuePair[] = invoices.map(invoice => ({
    value: invoice.price,
    date: new Date(invoice.year, invoice.month - 1, 1),
  }));

  items.reverse();
  items = padMissingValues(items, count);
  const data = items.map((item, index) => {
    const isEstimate = index === items.length - 1;
    const date = isEstimate ? moment().endOf('month').toDate() : item.date;
    return {
      label: formatCostChartLabel(item.value, date, isEstimate),
      value: item.value,
    };
  });

  return {
    title: translate('Total cost'),
    data,
    current: defaultCurrency(items[items.length - 1].value),
  };
};

const formatCostChartLabel = (value: number, date: string | Date, isEstimate: boolean): string => {
  let template = translate('{value} at {date}');
  if (isEstimate) {
    template = translate('{value} at {date}, estimated');
  }
  return translate(template, {
    value: defaultCurrency(value),
    date: formatDate(date),
  });
};

const getInvoiceSummary = (customer: string) =>
  getList<InvoiceSummary>('/invoices/', {customer, page_size: 12, field: ['year', 'month', 'price']});

async function getCustomerCharts(customer: Scope): Promise<Chart[]> {
  const quotas = [{
    quota: 'nc_user_count',
    title: translate('Team size'),
  }];
  const quotaCharts = await getDailyQuotaCharts(quotas, customer);
  const invoices = await getInvoiceSummary(customer.url);
  const costChart = formatCostChart(invoices, 12);
  return [costChart, ...quotaCharts];
}

export const loadSummary = async customer => {
  const charts: Chart[] = await getCustomerCharts(customer);
  return charts.map(chart => ({chart, options: getScopeChartOptions(chart.data.map(item => item.label), chart.data.map(item => item.value))}));
};
