import { getList } from '@waldur/core/api';
import { formatCostChart, getTeamSizeChart } from '@waldur/dashboard/api';
import { getLineChartOptions } from '@waldur/dashboard/chart';
import { Scope, Chart, InvoiceSummary } from '@waldur/dashboard/types';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';

const getInvoiceSummary = (customer: string) =>
  getList<InvoiceSummary>('/invoices/', {
    customer,
    page_size: 12,
    field: ['year', 'month', 'price'],
  });

async function getCustomerCostChart(customer: Scope): Promise<Chart> {
  if (!getActiveFixedPricePaymentProfile(customer.payment_profiles)) {
    const invoices = await getInvoiceSummary(customer.url);
    const costChart = formatCostChart(invoices);
    return costChart;
  }
  return null;
}

export const loadSummary = async (customer) => {
  const costChart = await getCustomerCostChart(customer);
  const teamChart = await getTeamSizeChart(customer);
  return {
    costChart: costChart
      ? {
          chart: costChart,
          options: getLineChartOptions(costChart),
        }
      : null,
    teamChart: teamChart
      ? {
          chart: teamChart,
          options: getLineChartOptions(teamChart),
        }
      : null,
  };
};
