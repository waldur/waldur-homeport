import { EyeIcon, QuestionIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { ComponentsUsageStats } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Customer } from '@waldur/workspace/types';

import { useAggregateLimitChart } from './utils';

interface AggregateLimitWidgetProps {
  project?: Project;
  customer?: Customer;
  data: ComponentsUsageStats;
  isLoading: boolean;
  refetch(): void;
  error: any;
  type?: 'monthly' | 'all';
}

const AggregateLimitDetailsDialog = lazyComponent(() =>
  import('./AggregateLimitDetailsDialog').then((module) => ({
    default: module.AggregateLimitDetailsDialog,
  })),
);

const AggregateLimitChartModal = lazyComponent(() =>
  import('./AggregateLimitChartModal').then((module) => ({
    default: module.AggregateLimitChartModal,
  })),
);

export const AggregateLimitWidget = ({
  project,
  customer,
  data,
  isLoading,
  error,
  refetch,
  type = 'all',
}: AggregateLimitWidgetProps) => {
  const dispatch = useDispatch();
  const isProject = !!project;
  const isMonthly = type === 'monthly';

  // Limit to 6 components for the dashboard view
  const { options } = useAggregateLimitChart(
    data || { components: [] },
    isMonthly,
    6,
  );

  const viewDetails = useCallback(
    () =>
      isProject
        ? dispatch(
            openModalDialog(AggregateLimitDetailsDialog, {
              resolve: {
                project,
                components: data?.components,
              },
              size: 'lg',
            }),
          )
        : dispatch(
            openModalDialog(AggregateLimitDetailsDialog, {
              resolve: {
                customer,
                components: data?.components,
              },
              size: 'lg',
            }),
          ),
    [dispatch, project, customer, data, isProject],
  );

  const viewAllComponents = useCallback(
    () =>
      dispatch(
        openModalDialog(AggregateLimitChartModal, {
          resolve: {
            data,
            isMonthly,
            title:
              type === 'monthly'
                ? translate("Current month's usage")
                : translate('Aggregate usage and limits'),
          },
          size: 'xl',
        }),
      ),
    [dispatch, data, isMonthly, type],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={
          isProject
            ? translate('Unable to load aggregate limits for this project')
            : translate('Unable to load aggregate limits for this customer')
        }
      />
    );
  }

  const components = data?.components;
  const title =
    type === 'monthly'
      ? translate("Current month's usage")
      : translate('Aggregate usage and limits');

  const TitleWithTip = () => (
    <>
      {title}{' '}
      <Tip
        id="aggregate-limit-tooltip"
        label={translate('You are viewing the chart in log scale mode.')}
      >
        <QuestionIcon />
      </Tip>
    </>
  );

  if (!components?.length || !options) {
    return null;
  }

  const showViewAllButton = components.length > 6;
  const actions = [
    {
      label: translate('Details'),
      icon: <EyeIcon />,
      callback: viewDetails,
    },
  ];

  const cardAction = () => {
    if (showViewAllButton) {
      return (
        <Button
          onClick={viewAllComponents}
          variant="link"
          size="sm"
          className="py-0"
        >
          {translate('View all')}
        </Button>
      );
    }
    return null;
  };

  return (
    <WidgetCard
      cardTitle={<TitleWithTip />}
      className="h-100"
      actions={actions}
      cardAction={cardAction()}
    >
      <EChart options={options} />
    </WidgetCard>
  );
};
