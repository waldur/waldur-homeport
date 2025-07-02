import { EyeIcon } from '@phosphor-icons/react';
import { Col } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

import { useProjectCreditChart } from './utils';

const FilteredEventsDialog = lazyComponent(() =>
  import('@waldur/customer/credits/CreditUsageDialog').then((module) => ({
    default: module.CreditUsageDialog,
  })),
);

export const ProjectDashboardCredit = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => {
  const { credit, chart, options, error, isLoading, refetch } =
    useProjectCreditChart(project);

  const { openDialog } = useModal();
  const viewDetails = () => {
    openDialog(FilteredEventsDialog, {
      size: 'xl',
      creditUuid: credit.uuid,
      projectUuid: project.uuid,
      projectName: project.name,
      scope: 'project',
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
              ({translate('Current balance')}: {defaultCurrency(credit.value)})
            </small>
          </>
        }
        actions={[
          {
            label: translate('Details'),
            icon: <EyeIcon />,
            callback: viewDetails,
          },
        ]}
        className="h-100"
      >
        <EChart options={options} height="130px" />
      </WidgetCard>
    </Col>
  );
};
