import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import {
  ResourcePoolUsage,
  proposalProtectedCallsResourcePoolUsageList,
} from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { HelpTip } from '@/core/HelpTip';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import {
  formatAmount,
  formatComponentUnit,
  RESOURCE_POOLS_TABLE,
} from '@/proposals/budgets';
import { getCallReadOnlyReason } from '@/proposals/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { Call } from '../../types';

import { PoolCell } from './PoolCell';

const PoolEditDialog = lazyComponent(() =>
  import('./PoolEditDialog').then((module) => ({
    default: module.PoolEditDialog,
  })),
);

interface CallResourcePoolsSectionProps {
  call: Call;
  isReadOnly?: boolean;
}

/** The rounds as the matrix orders its columns: by when they start. */
const orderedRounds = (call: Call) =>
  [...(call.rounds ?? [])].sort((a, b) =>
    String(a.start_time).localeCompare(String(b.start_time)),
  );

/** The matrix's columns: the whole call, then each round. */
const poolScopes = (call: Call) => [
  { uuid: null as string | null, title: translate('Whole call') },
  ...orderedRounds(call).map((callRound) => ({
    uuid: callRound.uuid,
    title: callRound.name,
  })),
];

const findCell = (row: ResourcePoolUsage, scopeUuid: string | null) =>
  row.cells.find((candidate) => (candidate.round_uuid ?? null) === scopeUuid);

/** A figure as a spreadsheet takes it: the bare number, or nothing. */
const exportAmount = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

/**
 * What the call awards: a matrix of each offering component with a rule
 * against the whole call and each round. A proposal draws on the call-wide
 * pool and on its round's, and must fit both.
 */
export const CallResourcePoolsSection: FC<CallResourcePoolsSectionProps> = ({
  call,
  isReadOnly,
}) => {
  const scopes = useMemo(() => poolScopes(call), [call]);
  // Four figures per scope, as columns of their own, so a spreadsheet can
  // sum them.
  const exportFields = useMemo(
    () => [
      translate('Offering'),
      translate('Component'),
      translate('Unit'),
      ...scopes.flatMap((scope) => [
        translate('{scope}: pool', { scope: scope.title }),
        translate('{scope}: requested', { scope: scope.title }),
        translate('{scope}: awarded', { scope: scope.title }),
        translate('{scope}: remaining', { scope: scope.title }),
      ]),
    ],
    [scopes],
  );
  const exportRow = useCallback(
    (row: ResourcePoolUsage) => [
      row.offering_name,
      row.component_name || row.component_type,
      row.measured_unit || '',
      ...scopes.flatMap((scope) => {
        const cell = findCell(row, scope.uuid);
        return [
          exportAmount(cell?.pool_uuid ? cell.offered_total : null),
          exportAmount(cell?.requested),
          exportAmount(cell?.awarded),
          exportAmount(cell?.remaining),
        ];
      }),
    ],
    [scopes],
  );
  const tableProps = useTable({
    table: RESOURCE_POOLS_TABLE,
    // One row per component rule, all at once: the endpoint is not paged.
    fetchData: () =>
      proposalProtectedCallsResourcePoolUsageList({
        path: { uuid: call.uuid },
      }).then(({ data }) => ({ rows: data, resultCount: data.length })),
    exportFields,
    exportRow,
  });
  const readOnlyReason = isReadOnly ? getCallReadOnlyReason(call) : undefined;
  const { openDialog } = useModal();

  // The unit and each scope's figures, as the row's key/value details.
  const expandableRow = useCallback(
    ({ row }: { row: ResourcePoolUsage }) => (
      <ExpandableContainer asTable>
        <PropertyItem
          label={translate('Unit')}
          value={
            row.limit_period && row.limit_period !== 'total'
              ? translate('{unit}, counted over each award’s length', {
                  unit: formatComponentUnit(
                    row.measured_unit,
                    row.limit_period,
                  ),
                })
              : row.measured_unit || translate('units')
          }
        />
        {!row.offering_component_uuid && (
          <PropertyItem
            label={translate('Per proposal')}
            value={translate('Any amount')}
          />
        )}
        {scopes.map((scope) => {
          const cell = findCell(row, scope.uuid);
          return cell ? (
            <PropertyItem
              key={scope.uuid ?? 'call'}
              label={scope.title}
              value={
                cell.remaining === null
                  ? translate('Requested {requested} · Awarded {awarded}', {
                      requested: formatAmount(cell.requested),
                      awarded: formatAmount(cell.awarded),
                    })
                  : translate(
                      'Requested {requested} · Awarded {awarded} · Remaining {remaining}',
                      {
                        requested: formatAmount(cell.requested),
                        awarded: formatAmount(cell.awarded),
                        remaining: formatAmount(cell.remaining),
                      },
                    )
              }
            />
          ) : null;
        })}
      </ExpandableContainer>
    ),
    [scopes],
  );

  const columns = useMemo<Column<ResourcePoolUsage>[]>(
    () => [
      {
        title: translate('Component'),
        render: ({ row }) => (
          <span className="font-medium text-primary">
            {row.offering_name} / {row.component_name || row.component_type}
          </span>
        ),
      },
      ...scopes.map((scope) => ({
        title: scope.title,
        render: ({ row }: { row: ResourcePoolUsage }) => {
          const cell = findCell(row, scope.uuid);
          const wholeCall = findCell(row, null);
          return cell ? (
            <PoolCell
              wholeCallTotal={
                wholeCall?.pool_uuid ? wholeCall.offered_total : null
              }
              row={row}
              cell={cell}
            />
          ) : null;
        },
      })),
    ],
    [scopes],
  );

  return (
    <Table<ResourcePoolUsage>
      {...tableProps}
      // A short list, shown whole.
      hasPagination={false}
      columns={columns}
      expandableRow={expandableRow}
      rowActions={({ row }: { row: ResourcePoolUsage }) =>
        readOnlyReason ? (
          <ActionsDropdown disabled tooltip={readOnlyReason} />
        ) : (
          <ActionsDropdown row={row} refetch={tableProps.fetch}>
            <ActionItem
              title={translate('Edit')}
              iconNode={<PencilSimpleIcon weight="bold" />}
              action={() =>
                openDialog(PoolEditDialog, {
                  resolve: {
                    callUuid: call.uuid,
                    row,
                    scopes: scopes
                      .map((scope) => ({
                        title: scope.title,
                        cell: findCell(row, scope.uuid),
                      }))
                      .filter(({ cell }) => cell),
                    refetch: () => tableProps.fetch(true),
                  },
                })
              }
            />
          </ActionsDropdown>
        )
      }
      title={translate('Resource pools')}
      verboseName={translate('resource pools')}
      enableExport
      subtitle={
        <>
          {translate('What the call awards per component and round.')}
          <HelpTip
            hasSpace
            label={translate(
              'A proposal may request between the minimum and maximum set on the Resources tab. The call settings say whether an award past the pool can be overridden. Awarded amounts include tentative and held awards.',
            )}
          />
        </>
      }
      placeholderComponent={
        <NoResult
          noAction
          title={translate('No components to pool')}
          message={translate(
            'None of the call’s offerings sells a component by the amount a proposal requests. Offerings are added on the Resources tab.',
          )}
        />
      }
    />
  );
};
