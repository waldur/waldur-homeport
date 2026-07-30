import {
  ClockCounterClockwiseIcon,
  EyeIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { Col } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { EChart } from '@/core/EChart';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { COMMON_WIDGET_HEIGHT } from '@/dashboard/constants';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { useProjectCreditChart } from './utils';

const CreditUsageDialog = lazyComponent(() =>
  import('@/customer/credits/CreditUsageDialog').then((module) => ({
    default: module.CreditUsageDialog,
  })),
);

const FilteredEventsDialog = lazyComponent(() =>
  import('@/events/FilteredEventsDialog').then((module) => ({
    default: module.FilteredEventsDialog,
  })),
);

export const ProjectDashboardCredit = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => {
  const { credit, costPolicies, chart, options, error, isLoading, refetch } =
    useProjectCreditChart(project);

  const { openDialog } = useModal();
  const viewDetails = () => {
    openDialog(CreditUsageDialog, {
      size: 'xl',
      creditUuid: credit.uuid,
      projectUuid: project.uuid,
      projectName: project.name,
      scope: 'project',
    });
  };
  const viewHistory = () => {
    openDialog(FilteredEventsDialog, {
      size: 'xl',
      filter: { feature: 'credits', project_uuid: project.uuid },
    });
  };

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
  if (!credit) {
    return null;
  }
  return (
    <Col md={6} sm={12} className={className} style={COMMON_WIDGET_HEIGHT}>
      <WidgetCard
        cardTitle={
          <>
            {chart.title}
            <small className="text-muted fs-7 ms-4 fw-normal">
              (
              {translate('{date} balance', {
                date: formatDate(DateTime.now().startOf('month')),
              })}
              : {defaultCurrency(credit.value)})
            </small>
            {costPolicies?.some(
              (p) =>
                !p.has_fired &&
                p.limit_cost > 0 &&
                Number(credit.value) > 0 &&
                Number(credit.value) <= p.limit_cost * 0.2,
            ) && (
              <Tip
                id="credit-policy-warning"
                label={translate(
                  'Credit balance is low. A cost policy may trigger soon, affecting resources in this project.',
                )}
              >
                <WarningOctagonIcon
                  className="text-warning ms-2"
                  weight="bold"
                  size={16}
                />
              </Tip>
            )}
          </>
        }
        actions={[
          {
            label: translate('Usage'),
            icon: <EyeIcon weight="bold" />,
            callback: viewDetails,
          },
          {
            label: translate('History'),
            icon: <ClockCounterClockwiseIcon weight="bold" />,
            callback: viewHistory,
          },
        ]}
        className="h-100"
      >
        <EChart options={options} height="130px" />
      </WidgetCard>
    </Col>
  );
};
