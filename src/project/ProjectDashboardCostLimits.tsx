import { EyeIcon, GearSixIcon, ListBulletsIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

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
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  const { chart, options, error, isLoading, refetch, currentMonthItems } =
    useProjectCostChart(project);

  const dispatch = useDispatch();
  const viewPolicies = useCallback(
    () =>
      dispatch(
        openModalDialog(CostPoliciesDetailsDialog, {
          resolve: { project },
          size: 'lg',
        }),
      ),
    [dispatch, project],
  );

  const viewBreakdown = useCallback(
    () =>
      dispatch(
        openModalDialog(CostBreakdownDialog, {
          resolve: { items: currentMonthItems },
          size: 'lg',
        }),
      ),
    [dispatch, currentMonthItems],
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
