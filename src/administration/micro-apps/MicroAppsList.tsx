import { SlidersHorizontalIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import { microAppSettingsList } from 'waldur-js-client';

import { useMicroApps } from 'waldur-shell';
import { Badge } from 'waldur-ui';

import {
  microAppFeatureKey,
  useActiveRuleCounts,
} from '@/administration/feature-rules/utils';
import { getAllPages } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';
import { checkIsStaff } from '@/workspace/selectors';

import {
  choiceOf,
  getChoiceLabel,
  joinMicroApps,
  MICRO_APP_SETTINGS_QUERY_KEY,
  MicroAppRow,
} from './utils';

const MicroAppModeDialog = lazyComponent(() =>
  import('./MicroAppModeDialog').then((module) => ({
    default: module.MicroAppModeDialog,
  })),
);

const FeatureRulesDialog = lazyComponent(() =>
  import('@/administration/feature-rules/FeatureRulesDialog').then(
    (module) => ({ default: module.FeatureRulesDialog }),
  ),
);

interface RowActionProps {
  row: MicroAppRow;
  refetch: () => void;
  canEdit: boolean;
}

const ChangeModeAction: FC<RowActionProps> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Change who gets it')}
      iconNode={<SlidersHorizontalIcon weight="bold" />}
      action={() =>
        openDialog(MicroAppModeDialog, { resolve: { row, refetch } })
      }
    />
  );
};

const AudienceAction: FC<RowActionProps> = ({ row, canEdit }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit audience')}
      iconNode={<UsersThreeIcon weight="bold" />}
      disabled={choiceOf(row) !== 'audience'}
      tooltip={
        choiceOf(row) !== 'audience'
          ? translate('Offer the app to selected users first.')
          : undefined
      }
      action={() =>
        openDialog(FeatureRulesDialog, {
          resolve: {
            featureKey: microAppFeatureKey(row.name),
            featureLabel: row.title,
            canEdit,
          },
          size: 'xl',
        })
      }
    />
  );
};

const STAFF_ACTIONS = [ChangeModeAction, AudienceAction];
const SUPPORT_ACTIONS = [AudienceAction];

/**
 * Who each micro-app in this portal's image is offered to. The image decides
 * which apps exist (micro-apps.json); the backend keeps the operator's
 * decision per app, and an app without one follows the micro-apps feature.
 */
export const MicroAppsList: FC = () => {
  const canEdit = checkIsStaff(useUser());
  const registry = useMicroApps(import.meta.env.BASE_URL);
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: MICRO_APP_SETTINGS_QUERY_KEY,
    queryFn: () =>
      getAllPages((page) =>
        microAppSettingsList({ query: { page, page_size: 100 } }),
      ),
  });
  const ruleCounts = useActiveRuleCounts(true);
  const rows = useMemo(
    () => joinMicroApps(registry, settings ?? []),
    [registry, settings],
  );

  const tableProps = useTable({
    table: 'MicroAppsList',
    fetchData: createClientPaginatedFetcher(rows),
  });
  // The fetcher closes over the rows: fetch again when they change.
  useEffect(() => {
    tableProps.fetch();
  }, [rows]);

  const actionData = useMemo(() => ({ canEdit }), [canEdit]);

  return (
    <Table<MicroAppRow>
      {...tableProps}
      title={translate('Micro-apps')}
      columns={[
        {
          title: translate('App'),
          render: ({ row }) => (
            <div className="flex flex-col">
              <span className="font-medium text-primary">{row.title}</span>
              <span className="text-xs text-quaternary">{row.name}</span>
            </div>
          ),
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('In this portal'),
          render: ({ row }) =>
            row.deployed ? (
              <Badge variant="success" size="sm" tone="outline">
                {translate('Deployed')}
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" tone="outline">
                {translate('Not deployed')}
              </Badge>
            ),
        },
        {
          title: translate('Offered to'),
          render: ({ row }) => {
            const choice = choiceOf(row);
            const count = ruleCounts[microAppFeatureKey(row.name)] ?? 0;
            return (
              <span data-testid={`micro-app-choice-${row.name}`}>
                {choice === 'audience'
                  ? translate('Selected users ({count})', { count })
                  : getChoiceLabel(choice)}
              </span>
            );
          },
        },
      ]}
      verboseName={translate('micro-apps')}
      hasPagination={false}
      rowActions={({ row }) => (
        <ActionsDropdown
          row={row}
          refetch={() => refetchSettings()}
          data={actionData}
          actions={canEdit ? STAFF_ACTIONS : SUPPORT_ACTIONS}
        />
      )}
    />
  );
};
