import {
  CheckCircleIcon,
  EyeIcon,
  GearSixIcon,
  ListBulletsIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { Project } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { useProjectCostChart } from './utils';

const CostPoliciesDetailsDialog = lazyComponent(() =>
  import('./CostPoliciesDetailsDialog').then((module) => ({
    default: module.CostPoliciesDetailsDialog,
  })),
);

const CostBreakdownDialog = lazyComponent(() =>
  import('./CostBreakdownDialog').then((module) => ({
    default: module.CostBreakdownDialog,
  })),
);

export const ProjectDashboardCostLimits = ({
  project,
}: {
  project: Project;
}) => {
  const router = useRouter();
  const user = useUser();
  const customer = useCustomer();
  const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);
  const canManageAutoApproval =
    !project.is_removed &&
    (user.is_staff ||
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        projectId: project.uuid,
        customerId: project.customer_uuid,
      }));

  const { chart, options, error, isLoading, refetch, currentMonthItems } =
    useProjectCostChart(project);

  const { openDialog } = useModal();
  const viewPolicies = useCallback(
    () =>
      openDialog(CostPoliciesDetailsDialog, {
        resolve: { project },
        size: 'lg',
      }),
    [project],
  );

  const viewBreakdown = useCallback(
    () =>
      openDialog(CostBreakdownDialog, {
        resolve: { items: currentMonthItems, project },
        size: 'lg',
      }),
    [currentMonthItems, project],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load data.')}
        loadData={refetch}
      />
    );
  }
  return (
    <WidgetCard
      cardTitle={
        <>
          {translate('Project cost')}
          <small className="text-muted fs-7 ms-4 fw-normal">
            ({translate('Current month\u2019s cost')}: {chart.current})
          </small>
        </>
      }
      className="h-100"
      actions={[
        isOwnerOrStaff && !project.is_removed
          ? {
              label: translate('Manage policy'),
              icon: <GearSixIcon weight="bold" />,
              callback: () =>
                router.stateService.go('organization-cost-policies', {
                  uuid: project.customer_uuid,
                }),
            }
          : null,
        canManageAutoApproval
          ? {
              label: translate('Manage order auto-approval'),
              icon: <CheckCircleIcon weight="bold" />,
              callback: () =>
                router.stateService.go('project-manage', {
                  uuid: project.uuid,
                  tab: 'order-approval',
                }),
            }
          : null,
        {
          label: translate('View cost policies'),
          icon: <EyeIcon weight="bold" />,
          callback: viewPolicies,
        },
        currentMonthItems?.length > 0
          ? {
              label: translate('Cost breakdown'),
              icon: <ListBulletsIcon weight="bold" />,
              callback: viewBreakdown,
            }
          : null,
      ].filter(Boolean)}
    >
      <EChart options={options} />
    </WidgetCard>
  );
};
