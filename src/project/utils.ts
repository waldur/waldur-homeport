import { GlobeSimpleIcon, GraduationCapIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  InvoiceCostItem,
  invoiceItemsCostsList,
  KindEnum,
  marketplaceProjectEstimatedCostPoliciesList,
  marketplaceProjectOrderAutoApprovalsList,
  projectCreditsList,
} from 'waldur-js-client';

import { SHORT_STALE_TIME, STALE_TIME } from '@/core/constants';
import { defaultCurrency } from '@/core/formatCurrency';
import { getCostPolicyActionOptions } from '@/customer/cost-policies/utils';
import { getLineChartOptions } from '@/dashboard/chart';
import {
  formatProjectCostChart,
  getTeamSizeChart,
  getCreditChartAndOptions,
  getCostChartAndOptions,
} from '@/dashboard/utils';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useProject } from '@/workspace/hooks';
import { Project, User } from '@/workspace/types';

async function getProjectCostData(project: Project) {
  const [invoices, costPolicies, autoApprovalRules] = await Promise.all([
    invoiceItemsCostsList({
      query: {
        project_uuid: project.uuid,
        page: 1,
        page_size: 12,
      },
    }).then((response) => response.data),
    marketplaceProjectEstimatedCostPoliciesList({
      query: {
        scope_uuid: project.uuid,
        page: 1,
        page_size: 3,
      },
    }).then((response) => response.data),
    marketplaceProjectOrderAutoApprovalsList({
      query: { project_uuid: project.uuid },
    }).then((response) => response.data),
  ]);
  return {
    invoices,
    costPolicies,
    autoApprovalRule: autoApprovalRules?.[0] ?? null,
  };
}

export function useProjectCostChart(project: Project) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProjectCostData', project?.uuid],
    queryFn: () => (project ? getProjectCostData(project) : null),
    staleTime: STALE_TIME,
    enabled: Boolean(project),
  });

  const chartData = useMemo(() => {
    if (!data) return { chart: null, options: null, currentMonthItems: null };
    const chart = formatProjectCostChart(data.invoices);

    const hlines = (data.costPolicies || []).map((item) => {
      const limitCost = defaultCurrency(item.limit_cost);
      const projectCredit = item.project_credit
        ? defaultCurrency(item.project_credit)
        : null;

      const totalCost = item.limit_cost + (Number(item.project_credit) || 0);
      const totalCostFormatted = defaultCurrency(totalCost);
      const action = getCostPolicyActionOptions().find(
        (option) => option.value === item.actions,
      )?.label;

      const label = projectCredit
        ? `Policy: ${action}\n${translate('Sum')}: ${totalCostFormatted}, ${translate('Limit')}: ${limitCost}, ${translate('Credit')}: ${projectCredit}`
        : `Policy: ${action}\n${translate('Limit')}: ${limitCost}`;

      return {
        label,
        value: totalCost,
      };
    });

    if (data.autoApprovalRule?.enabled) {
      const limit = parseFloat(data.autoApprovalRule.monthly_cost_limit);
      hlines.push({
        label: `${translate('Auto-approval limit')}: ${defaultCurrency(limit)} / ${translate('month')}`,
        value: limit,
      });
    }

    // Extract items from the current month invoice entry
    const currentMonthEntry = data.invoices.find(
      (inv) => inv.items && inv.items.length > 0,
    );
    const currentMonthItems: InvoiceCostItem[] = currentMonthEntry?.items || [];

    return { ...getCostChartAndOptions(chart, hlines), currentMonthItems };
  }, [data]);

  return {
    isLoading,
    error,
    refetch,
    chart: chartData?.chart,
    options: chartData?.options,
    currentMonthItems: chartData?.currentMonthItems,
  };
}

export function useProjectCreditChart(project: Project) {
  const {
    data: costData,
    isLoading: isCostLoading,
    error: costError,
    refetch: refetchCost,
  } = useQuery({
    queryKey: ['ProjectCostData', project?.uuid],
    queryFn: () => (project ? getProjectCostData(project) : null),
    staleTime: STALE_TIME,
    enabled: Boolean(project),
  });

  const {
    data: creditData,
    isLoading: isCreditLoading,
    error: creditError,
    refetch: refetchCredit,
  } = useQuery({
    queryKey: ['ProjectCreditData', project?.uuid],

    queryFn: () =>
      projectCreditsList({
        query: { project_uuid: project?.uuid },
      }).then((response) => response.data.length > 0 && response.data[0]),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
    enabled: Boolean(project),
  });

  const chartData = useMemo(() => {
    if (!costData || !creditData) return { chart: null, options: null };
    return getCreditChartAndOptions(costData.invoices, creditData?.value);
  }, [costData, creditData]);

  return {
    credit: creditData,
    costPolicies: costData?.costPolicies || [],
    isLoading: isCostLoading || isCreditLoading,
    error: costError || creditError,
    refetch: () => {
      refetchCost();
      refetchCredit();
    },
    chart: chartData.chart,
    options: chartData.options,
  };
}

export const getProjectTeamChart = async (project: Project) => {
  const chart = await getTeamSizeChart(project);
  if (chart) {
    return {
      chart,
      options: getLineChartOptions(chart),
    };
  }
  return null;
};

export const canEditProject = (user: User, context: { customer?; project? }) =>
  hasPermission(user, {
    permission: PermissionEnum.UPDATE_PROJECT,
    customerId: context?.customer?.uuid,
  }) ||
  hasPermission(user, {
    permission: PermissionEnum.UPDATE_PROJECT,
    projectId: context?.project?.uuid,
  });

export const useHasProjectPermission = (permission) => {
  const user = useUser();
  const project = useProject();

  return hasPermission(user, {
    projectId: project?.uuid,
    permission,
  });
};

export const projectKindOptions = (): Partial<
  Record<KindEnum, { value: KindEnum; label; color; icon }>
> => {
  const baseOptions = {
    default: {
      value: 'default' as KindEnum,
      label: translate('Regular'),
      color: 'default',
      icon: null,
    },
    course: {
      value: 'course' as KindEnum,
      label: translate('Course'),
      color: 'pink',
      icon: GraduationCapIcon,
    },
  };

  if (isExperimentalUiComponentsVisible()) {
    return {
      ...baseOptions,
      public: {
        value: 'public' as KindEnum,
        label: translate('Public'),
        color: 'blue',
        icon: GlobeSimpleIcon,
      },
    };
  }

  return baseOptions;
};
