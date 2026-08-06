import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  ComponentsUsageStats,
  InvoiceCost,
  invoicesList,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { getLineChartOptions } from '@/dashboard/chart';
import { Scope } from '@/dashboard/types';
import {
  formatOrganizationCostChart,
  getCostChartAndOptions,
  getCreditChartAndOptions,
  getTeamSizeChart,
} from '@/dashboard/utils';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { Customer } from '@/workspace/types';

async function getCustomerCostData(customer: Scope) {
  if (!getActiveFixedPricePaymentProfile(customer.payment_profiles)) {
    const invoices = await invoicesList({
      query: {
        customer: customer.url,
        page_size: 12,
        field: ['year', 'month', 'price', 'compensations', 'incurred_costs'],
      },
    });

    return invoices.data;
  }
  return null;
}

export function useCustomerCostChart(customer: Scope) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['CustomerCostData', customer?.url],
    queryFn: () => (customer ? getCustomerCostData(customer) : null),
    staleTime: STALE_TIME,
    enabled: Boolean(customer),
  });

  const chartData = useMemo(() => {
    if (!data) return { chart: null, options: null };

    const costChart = formatOrganizationCostChart(data);
    return getCostChartAndOptions(costChart);
  }, [data]);

  return { ...chartData, isLoading, error, refetch };
}

export function useCustomerCreditChart(customer: Customer) {
  const {
    data: invoices,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['CustomerCostData', customer.url],
    queryFn: () => getCustomerCostData(customer),
    staleTime: STALE_TIME,
  });

  const chartData = useMemo(() => {
    if (!customer.credit) return { chart: null, options: null };
    const invoiceCosts: InvoiceCost[] = (invoices || []).map((invoice) => ({
      year: invoice.year,
      month: invoice.month,
      price: Number(invoice.price),
      // Invoice exposes `compensations` (plural); InvoiceCost (project-level)
      // exposes `compensation`.
      compensation: Number(invoice.compensations),
      // Likewise `incurred_costs` against InvoiceCost's `incurred`: the gross
      // cost, of which `price` is the net after compensation. Already in the
      // requested field list above.
      incurred: Number(invoice.incurred_costs),
    }));
    return getCreditChartAndOptions(invoiceCosts, customer.credit?.value);
  }, [invoices, customer]);

  return {
    credit: customer.credit,
    isLoading,
    error,
    refetch,
    chart: chartData.chart,
    options: chartData.options,
  };
}

export const useCustomerTeamChart = (customer) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['CustomerTeamChart', customer.url],
    queryFn: () => getTeamSizeChart(customer),
    staleTime: STALE_TIME,
  });

  const chartData = useMemo(
    () =>
      data
        ? {
            chart: data,
            options: getLineChartOptions(data),
          }
        : {},
    [data],
  );

  return { ...chartData, isLoading, error, refetch };
};

export const filterComponentsWithUsage = (data: ComponentsUsageStats) => {
  if (!data || !data.components || !data.components.length) {
    return data;
  }

  const filteredComponents = data.components.filter((component) => {
    const usageValue =
      component.billing_type === 'limit'
        ? component.limit_usage
        : component.usage;

    return usageValue > 0;
  });

  return {
    ...data,
    components: filteredComponents,
  };
};
