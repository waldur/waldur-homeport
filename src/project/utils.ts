import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  invoiceItemsCostsList,
  marketplaceProjectEstimatedCostPoliciesList,
  projectCreditsList,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getCostPolicyActionOptions } from '@waldur/customer/cost-policies/utils';
import { getLineChartOptions } from '@waldur/dashboard/chart';
import {
  formatProjectCostChart,
  getTeamSizeChart,
  getCreditChartAndOptions,
  getCostChartAndOptions,
} from '@waldur/dashboard/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Project, User } from '@waldur/workspace/types';

async function getProjectCostData(project: Project) {
  const [invoices, costPolicies] = await Promise.all([
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
  ]);
  return { invoices, costPolicies };
}

export function useProjectCostChart(project: Project) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProjectCostData', project?.uuid],
    queryFn: () => (project ? getProjectCostData(project) : null),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!data) return { chart: null, options: null };
    const chart = formatProjectCostChart(data.invoices);

    const hlines = (data.costPolicies || []).map((item) => {
      const limitCost = defaultCurrency(item.limit_cost);
      const projectCredit = item.project_credit
        ? defaultCurrency(item.project_credit)
        : null;

      const totalCost = item.limit_cost + (item.project_credit || 0);
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

    return getCostChartAndOptions(chart, hlines);
  }, [data]);

  return {
    isLoading,
    error,
    refetch,
    chart: chartData?.chart,
    options: chartData?.options,
  };
}

export function useProjectCreditChart(project: Project) {
  const {
    data: costData,
    isLoading: isCostLoading,
    error: costError,
    refetch: refetchCost,
  } = useQuery({
    queryKey: ['ProjectCostData', project.uuid],
    queryFn: () => getProjectCostData(project),
    staleTime: 5 * 60 * 1000,
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
    staleTime: 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!costData || !creditData) return { chart: null, options: null };
    return getCreditChartAndOptions(costData.invoices, creditData?.value);
  }, [costData, creditData]);

  return {
    credit: creditData,
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

export const PROJECT_TEAM_TABLE_TABS = [
  {
    key: 'users',
    title: translate('Active'),
    state: 'project-users',
  },
  {
    key: 'project-invitations',
    title: translate('Invitations'),
    state: 'project-invitations',
  },
  isFeatureVisible(InvitationsFeatures.show_service_accounts) && {
    key: 'project-service-accounts',
    title: translate('Service accounts'),
    state: 'project-service-accounts',
  },
];
