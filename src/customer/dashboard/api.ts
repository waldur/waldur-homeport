import { getList } from '@waldur/core/api';
import { formatCostChart } from '@waldur/dashboard/api';
import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { LINE_CHART_COLOR } from '@waldur/dashboard/constants';
import { Scope, Chart, InvoiceSummary } from '@waldur/dashboard/types';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';

const getInvoiceSummary = (customer: string) =>
  getList<InvoiceSummary>('/invoices/', {
    customer,
    page_size: 12,
    field: ['year', 'month', 'price'],
  });

async function getCustomerCharts(customer: Scope): Promise<Chart[]> {
  const charts: Chart[] = [];
  if (!getActiveFixedPricePaymentProfile(customer.payment_profiles)) {
    const invoices = await getInvoiceSummary(customer.url);
    const costChart = formatCostChart(invoices);
    charts.push(costChart);
  }
  return charts;
}

export const loadSummary = async (customer) => {
  const charts: Chart[] = await getCustomerCharts(customer);
  return charts.map((chart) => ({
    chart,
    options: getScopeChartOptions(
      chart.data.map((item) => item.label),
      chart.data.map((item) => item.value),
      null,
      LINE_CHART_COLOR,
    ),
  }));
};
