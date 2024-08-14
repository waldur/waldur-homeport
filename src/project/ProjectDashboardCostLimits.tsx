import { Eye, GearSix } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { EChart } from '@waldur/core/EChart';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { openModalDialog } from '@waldur/modal/actions';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { loadChart } from './utils';

const CostPoliciesDetailsDialog = lazyComponent(
  () => import('./CostPoliciesDetailsDialog'),
  'CostPoliciesDetailsDialog',
);

export const ProjectDashboardCostLimits = ({
  project,
}: {
  project: Project;
}) => {
  const router = useRouter();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  const { data, isLoading, error, refetch } = useQuery(
    ['ProjectDashboardChart', project.uuid],
    () => loadChart(project),
    { staleTime: 5 * 60 * 1000 },
  );

  const dispatch = useDispatch();
  const viewDetails = useCallback(
    () =>
      dispatch(
        openModalDialog(CostPoliciesDetailsDialog, {
          resolve: { project },
          size: 'lg',
        }),
      ),
    [dispatch, project],
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
      cardTitle={translate('Project cost')}
      title={data.chart.current}
      className="h-100"
      actions={[
        isOwnerOrStaff
          ? {
              label: translate('Manage policy'),
              icon: <GearSix />,
              callback: () =>
                router.stateService.go('organization-cost-policies', {
                  uuid: project.customer_uuid,
                }),
            }
          : null,
        {
          label: translate('View details'),
          icon: <Eye />,
          callback: viewDetails,
        },
      ].filter(Boolean)}
      meta={
        data.chart.changes
          ? translate(
              '{changes} vs last month',
              {
                changes: (
                  <ChangesAmountBadge
                    changes={data.chart.changes}
                    showOnInfinity
                    showOnZero
                    asBadge={false}
                  />
                ),
              },
              formatJsxTemplate,
            )
          : null
      }
    >
      <Col xs={7}>
        <EChart options={data.options} height="100px" />
      </Col>
    </WidgetCard>
  );
};
