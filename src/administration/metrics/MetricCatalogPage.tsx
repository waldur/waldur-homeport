import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  MetricDefinition,
  RetentionPolicy,
  marketplaceMetricDefinitionsList,
  marketplaceMetricRetentionPoliciesList,
} from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { formatUnit, getKindLabel } from '@/marketplace/metrics/options';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const MetricDefinitionDialog = lazyComponent(() =>
  import('./MetricDefinitionDialog').then((module) => ({
    default: module.MetricDefinitionDialog,
  })),
);

const RetentionPolicyDialog = lazyComponent(() =>
  import('./RetentionPolicyDialog').then((module) => ({
    default: module.RetentionPolicyDialog,
  })),
);

const AddButton: FC<{ label: string; onClick(): void }> = ({
  label,
  onClick,
}) => (
  <BaseButton
    iconNode={<PlusCircleIcon weight="bold" />}
    label={label}
    onClick={onClick}
    variant="tertiary"
    size="lg"
  />
);

const EditAction: FC<{ onClick(): void }> = ({ onClick }) => (
  <ActionItem
    title={translate('Edit')}
    iconNode={<PencilSimpleIcon weight="bold" />}
    action={onClick}
  />
);

export const MetricCatalogPage: FC = () => {
  const { openDialog } = useModal();
  const definitions = useTable<MetricDefinition>({
    table: 'MetricDefinitionsList',
    fetchData: createFetcher(marketplaceMetricDefinitionsList),
  });
  const policies = useTable<RetentionPolicy>({
    table: 'MetricRetentionPoliciesList',
    fetchData: createFetcher(marketplaceMetricRetentionPoliciesList),
  });

  return (
    <>
      <Table<MetricDefinition>
        {...definitions}
        title={translate('Metric catalogue')}
        subtitle={translate(
          'Metrics offerings can adopt. Providers may add private ones for their own offerings.',
        )}
        columns={[
          {
            title: translate('Metric'),
            render: ({ row }) => (
              <span className="text-dark fw-semibold">{row.name}</span>
            ),
          },
          {
            title: translate('Key'),
            render: ({ row }) => <code>{row.key}</code>,
          },
          {
            title: translate('Kind'),
            render: ({ row }) =>
              row.unit
                ? `${getKindLabel(row.kind)} · ${formatUnit(row.unit)}`
                : getKindLabel(row.kind),
          },
          {
            title: translate('Attributes'),
            render: ({ row }) =>
              renderFieldOrDash(row.attribute_keys?.join(', ')),
          },
          {
            title: translate('Owner'),
            render: ({ row }) => row.owner_customer_name || translate('Global'),
          },
          {
            title: translate('State'),
            render: ({ row }) => (
              <Badge
                variant={row.state === 'active' ? 'success' : 'neutral'}
                shape="pill"
                tone="outline"
              >
                {row.state === 'active'
                  ? translate('Active')
                  : translate('Deprecated')}
              </Badge>
            ),
          },
        ]}
        verboseName={translate('metric definitions')}
        hasQuery={false}
        rowActions={({ row }) => (
          <ActionsDropdown row={row} refetch={definitions.fetch}>
            <EditAction
              onClick={() =>
                openDialog(MetricDefinitionDialog, {
                  resolve: { row, refetch: definitions.fetch },
                  size: 'lg',
                })
              }
            />
          </ActionsDropdown>
        )}
        tableActions={
          <AddButton
            label={translate('Add metric')}
            onClick={() =>
              openDialog(MetricDefinitionDialog, {
                resolve: { refetch: definitions.fetch },
                size: 'lg',
              })
            }
          />
        }
      />
      <Table<RetentionPolicy>
        {...policies}
        className="mt-6"
        title={translate('Retention policies')}
        subtitle={translate(
          'How long raw points and hourly and daily roll-ups are kept.',
        )}
        columns={[
          { title: translate('Name'), render: ({ row }) => row.name },
          {
            title: translate('Raw points'),
            render: ({ row }) => `${row.raw_days} d`,
          },
          {
            title: translate('Hourly roll-ups'),
            render: ({ row }) => `${row.hourly_days} d`,
          },
          {
            title: translate('Daily roll-ups'),
            render: ({ row }) =>
              row.daily_days ? `${row.daily_days} d` : translate('Forever'),
          },
        ]}
        verboseName={translate('retention policies')}
        hasQuery={false}
        rowActions={({ row }) => (
          <ActionsDropdown row={row} refetch={policies.fetch}>
            <EditAction
              onClick={() =>
                openDialog(RetentionPolicyDialog, {
                  resolve: { row, refetch: policies.fetch },
                })
              }
            />
          </ActionsDropdown>
        )}
        tableActions={
          <AddButton
            label={translate('Add policy')}
            onClick={() =>
              openDialog(RetentionPolicyDialog, {
                resolve: { refetch: policies.fetch },
              })
            }
          />
        }
      />
    </>
  );
};
