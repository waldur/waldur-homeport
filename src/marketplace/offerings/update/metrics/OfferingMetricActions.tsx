import {
  ArchiveIcon,
  FlagIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import {
  OfferingMetric,
  marketplaceMetricGoalsList,
  marketplaceOfferingMetricsArchive,
  marketplaceOfferingMetricsDestroy,
  marketplaceOfferingMetricsPause,
  marketplaceOfferingMetricsPurge,
  marketplaceOfferingMetricsResume,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

const OfferingMetricDialog = lazyComponent(() =>
  import('./OfferingMetricDialog').then((module) => ({
    default: module.OfferingMetricDialog,
  })),
);

const MetricGoalDialog = lazyComponent(() =>
  import('@/marketplace/metrics/MetricGoalDialog').then((module) => ({
    default: module.MetricGoalDialog,
  })),
);

export const AdoptMetricButton: FC<{
  offering: { uuid: string; customer_uuid?: string };
  refetch(): void;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Adopt metric')}
      onClick={() =>
        openDialog(OfferingMetricDialog, {
          resolve: { offering, refetch },
        })
      }
      variant="tertiary"
      size="lg"
    />
  );
};

interface RowProps {
  row: OfferingMetric;
  refetch(): void;
}

export const EditMetricAction: FC<RowProps> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(OfferingMetricDialog, { resolve: { row, refetch } })
      }
    />
  );
};

export const DefaultGoalAction: FC<RowProps> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const { showErrorResponse } = useNotify();
  return (
    <ActionItem
      title={translate('Default goal')}
      iconNode={<FlagIcon weight="bold" />}
      action={async () => {
        try {
          const { data } = await marketplaceMetricGoalsList({
            query: { offering_metric_uuid: row.uuid, is_default: true },
          });
          openDialog(MetricGoalDialog, {
            resolve: { offeringMetric: row, goal: data[0] ?? null, refetch },
          });
        } catch (error) {
          showErrorResponse(
            error,
            translate('Unable to load the default goal.'),
          );
        }
      }}
    />
  );
};

const useStateAction = (
  call: (options: { path: { uuid: string } }) => Promise<any>,
  row: OfferingMetric,
  refetch: () => void,
  successMessage: string,
  confirmation?: { title: string; body: string; button: string },
) =>
  useManagedMutation<any, any, void>({
    mutationFn: () => call({ path: { uuid: row.uuid } }),
    successMessage,
    errorMessage: translate('Unable to change the metric.'),
    refetch,
    closeModal: false,
    confirmation: confirmation && {
      title: confirmation.title,
      body: confirmation.body,
      options: { forDeletion: true, positiveButton: confirmation.button },
    },
  });

export const LifecycleActions: FC<RowProps> = ({ row, refetch }) => {
  const pause = useStateAction(
    marketplaceOfferingMetricsPause,
    row,
    refetch,
    translate('Metric has been paused.'),
  );
  const resume = useStateAction(
    marketplaceOfferingMetricsResume,
    row,
    refetch,
    translate('Metric has been resumed.'),
  );
  const archive = useStateAction(
    marketplaceOfferingMetricsArchive,
    row,
    refetch,
    translate('Metric has been archived.'),
    {
      title: translate('Archive {name}?', { name: row.name }),
      body: translate(
        'Services can no longer report it and projects no longer see it. Its data is purged automatically after the grace period (30 days by default) unless you resume it.',
      ),
      button: translate('Archive'),
    },
  );
  const purge = useStateAction(
    marketplaceOfferingMetricsPurge,
    row,
    refetch,
    translate('Metric data is being purged.'),
    {
      title: translate('Purge {name}?', { name: row.name }),
      body: translate(
        'Every point and roll-up this metric collected is deleted, then the metric itself. This cannot be undone.',
      ),
      button: translate('Purge'),
    },
  );
  const remove = useStateAction(
    marketplaceOfferingMetricsDestroy,
    row,
    refetch,
    translate('Metric has been removed.'),
    {
      title: translate('Remove {name}?', { name: row.name }),
      body: translate(
        'Only a metric that never received data can be removed; otherwise archive it.',
      ),
      button: translate('Remove'),
    },
  );
  return (
    <>
      {row.state === 'active' && (
        <ActionItem
          title={translate('Pause')}
          iconNode={<PauseIcon weight="bold" />}
          action={() => pause.mutate()}
        />
      )}
      {row.state !== 'active' && (
        <ActionItem
          title={translate('Resume')}
          iconNode={<PlayIcon weight="bold" />}
          action={() => resume.mutate()}
        />
      )}
      {row.state !== 'archived' && (
        <ActionItem
          title={translate('Archive')}
          iconNode={<ArchiveIcon weight="bold" />}
          action={() => archive.mutate()}
        />
      )}
      {row.state === 'archived' && (
        <ActionItem
          title={translate('Purge data')}
          iconNode={<TrashIcon weight="bold" />}
          iconColor="danger"
          className="text-danger"
          action={() => purge.mutate()}
        />
      )}
      <ActionItem
        title={translate('Remove')}
        iconNode={<TrashIcon weight="bold" />}
        iconColor="danger"
        className="text-danger"
        action={() => remove.mutate()}
      />
    </>
  );
};
