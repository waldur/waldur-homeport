import { EyeIcon, QuestionIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { ComponentsUsageStats } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CompactActionButton } from '@/table/CompactActionButton';
import { Customer } from '@/workspace/types';

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
  const { openDialog } = useModal();
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
        ? openDialog(AggregateLimitDetailsDialog, {
            resolve: {
              project,
              components: data?.components,
            },
            size: 'lg',
          })
        : openDialog(AggregateLimitDetailsDialog, {
            resolve: {
              customer,
              components: data?.components,
            },
            size: 'lg',
          }),
    [project, customer, data, isProject],
  );

  const viewAllComponents = useCallback(
    () =>
      openDialog(AggregateLimitChartModal, {
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
    [data, isMonthly, type],
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
        <QuestionIcon weight="bold" />
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
      icon: <EyeIcon weight="bold" />,
      callback: viewDetails,
    },
  ];

  const cardAction = () => {
    if (showViewAllButton) {
      return (
        <CompactActionButton
          action={viewAllComponents}
          title={translate('View all')}
          variant="link"
          className="py-0"
        />
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
