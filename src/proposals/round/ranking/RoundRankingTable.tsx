import {
  PencilSimpleIcon,
  PlusCircleIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  ProposalRanking,
  proposalRankingsDestroy,
  proposalRankingsList,
  proposalRankingsPartialUpdate,
} from 'waldur-js-client';

import { BaseButton, Code } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { TableFullExport } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { InlineNumberCell } from './InlineNumberCell';
import {
  fetchRankingChoices,
  getNamedRecommendation,
  isRankingLocked,
  RankingReport,
  rankingExportUrl,
  roundRankingsKey,
} from './rankings';

const RankingFormDialog = lazyComponent(() =>
  import('./RankingFormDialog').then((m) => ({ default: m.RankingFormDialog })),
);

const ImportRankingDialog = lazyComponent(() =>
  import('./ImportRankingDialog').then((m) => ({
    default: m.ImportRankingDialog,
  })),
);

interface RoundRankingTableProps {
  round: {
    uuid: string;
    name: string;
    slug?: string;
    lifecycle_state?: string | null;
  };
  /** The call's managers edit; panel members only read. */
  canEdit: boolean;
  /**
   * A round report's ranking instead of the round's overall one: only the
   * proposals it covers, ranked by its author.
   */
  report?: RankingReport;
}

const RecommendationCell: FC<{ row: ProposalRanking }> = ({ row }) => {
  const entries = getNamedRecommendation(row);
  if (!entries.length) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <div className="flex flex-col">
      {entries.map((entry) => (
        <span key={entry.uuid} className="wrap-anywhere">
          {entry.offering ? (
            <span className="font-semibold">{entry.offering}: </span>
          ) : null}
          {entry.amounts}
        </span>
      ))}
    </div>
  );
};

const RankingRowActions: FC<{
  row: ProposalRanking;
  round: RoundRankingTableProps['round'];
  refetch(): void;
}> = ({ row, round, refetch }) => {
  const { openDialog } = useModal();
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () => proposalRankingsDestroy({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Remove from ranking'),
      body: translate('Remove {proposal} from the ranking of this round?', {
        proposal: row.proposal_name,
      }),
    },
    successMessage: translate(
      'The proposal has been removed from the ranking.',
    ),
    errorMessage: translate('Unable to remove the ranking.'),
    refetch,
  });
  return (
    <ActionsDropdown row={row}>
      <ActionItem
        title={translate('Edit')}
        iconNode={<PencilSimpleIcon weight="bold" />}
        action={() =>
          openDialog(RankingFormDialog, {
            resolve: {
              roundUuid: round.uuid,
              roundName: round.name,
              ranking: row,
              refetch,
            },
            size: 'lg',
          })
        }
      />
      <RemovalActionItem
        title={translate('Remove')}
        action={() => remove.mutate()}
        disabled={remove.isPending}
      />
    </ActionsDropdown>
  );
};

/**
 * The round's ranking: where the committee placed each proposal, its final
 * score and the resources recommended for it. Sortable; the call's managers
 * edit rank and score in place, the rest in the row's dialog, and import or
 * export the whole ranking as CSV until the round goes to its decision.
 */
export const RoundRankingTable: FC<RoundRankingTableProps> = ({
  round,
  canEdit,
  report,
}) => {
  const { openDialog } = useModal();
  const locked = isRankingLocked(round.lifecycle_state);
  const editable = canEdit && !locked;
  const reportUuid = report?.uuid;

  const filter = useMemo(
    () => ({
      round_uuid: round.uuid,
      ...(reportUuid ? { meeting_note_uuid: reportUuid } : {}),
    }),
    [round.uuid, reportUuid],
  );
  const tableProps = useTable({
    table: `RoundRanking-${round.uuid}-${reportUuid ?? 'overall'}`,
    fetchData: createFetcher(proposalRankingsList),
    filter,
  });

  // The proposals not ranked yet and the next free rank come from the whole
  // ranking and every proposal being evaluated -- or the report covers --
  // not the page on show.
  const choices = useQuery({
    queryKey: [...roundRankingsKey(round.uuid), 'choices', reportUuid],
    queryFn: () => fetchRankingChoices(round.uuid, report),
    enabled: editable,
    refetchOnWindowFocus: false,
  });
  const unranked = choices.data?.options ?? [];
  const nextRank = choices.data?.nextRank ?? 1;

  const refetch = useCallback(() => {
    tableProps.fetch();
    void choices.refetch();
  }, [tableProps.fetch, choices.refetch]);

  const update = useCallback(
    async (row: ProposalRanking, body: Partial<ProposalRanking>) => {
      await proposalRankingsPartialUpdate({ path: { uuid: row.uuid }, body });
      refetch();
    },
    [refetch],
  );

  // The file the server writes is the one Import CSV reads back.
  const fullExport = useMemo<TableFullExport>(
    () => ({
      label: translate('Ranking for import'),
      description: translate(
        'Every proposal of the round, ranked or not, in the columns Import CSV reads back.',
      ),
      errorMessage: translate('Unable to export the ranking.'),
      download: ({ signal }) =>
        downloadFile(
          rankingExportUrl(round.uuid, reportUuid),
          `ranking-${round.slug || round.uuid}.csv`,
          signal,
        ),
    }),
    [round.uuid, round.slug, reportUuid],
  );

  const openAdd = useCallback(
    () =>
      openDialog(RankingFormDialog, {
        resolve: {
          roundUuid: round.uuid,
          roundName: round.name,
          meetingNoteUuid: reportUuid,
          proposalOptions: unranked,
          nextRank,
          refetch,
        },
        size: 'lg',
      }),
    [
      openDialog,
      round.uuid,
      round.name,
      reportUuid,
      unranked,
      nextRank,
      refetch,
    ],
  );

  const openImport = useCallback(
    () =>
      openDialog(ImportRankingDialog, {
        resolve: {
          roundUuid: round.uuid,
          roundName: round.name,
          meetingNoteUuid: reportUuid,
          refetch,
        },
      }),
    [openDialog, round.uuid, round.name, reportUuid, refetch],
  );

  const rowActions = useMemo(
    () =>
      editable
        ? ({ row }: { row: ProposalRanking }) => (
            <RankingRowActions row={row} round={round} refetch={refetch} />
          )
        : undefined,
    [editable, round, refetch],
  );

  const lockedReason = translate(
    'The ranking was fixed when the round went to its decision.',
  );

  return (
    <Table<ProposalRanking>
      {...tableProps}
      key={editable ? 'editable' : 'read-only'}
      id={`round-ranking-${round.uuid}-${reportUuid ?? 'overall'}`}
      title={
        report ? translate('Ranking in this report') : translate('Ranking')
      }
      // Under a Ranking tab the title would repeat it.
      hideTitle={!report}
      headerClassName={report ? undefined : 'min-h-[40px] py-0'}
      dropdownActionsSize={report ? undefined : 'sm'}
      verboseName={translate('ranked proposals')}
      // Nothing was searched: an empty ranking is not a search to retry.
      placeholderHasRetry={false}
      emptyMessage={
        editable
          ? translate('No proposal is ranked yet. Rank one, or import a CSV.')
          : translate('No proposal is ranked yet.')
      }
      columns={[
        {
          title: translate('Rank'),
          orderField: 'rank',
          // Functions, not field names: a field name would narrow what
          // "All pages" fetches to the named fields alone.
          export: (row) => row.rank,
          render: ({ row }) => (
            <InlineNumberCell
              value={row.rank}
              label={translate('Rank')}
              integer
              editable={editable}
              onSave={(rank) => update(row, { rank: rank as number })}
            />
          ),
          width: '10%',
          ellipsis: false,
        },
        {
          title: translate('Proposal'),
          orderField: 'proposal_name',
          export: (row) =>
            [row.proposal_name, row.proposal_slug].filter(Boolean).join(', '),
          render: ({ row }) => (
            <div className="flex flex-col">
              <span className="font-semibold wrap-anywhere">
                {row.proposal_name}
              </span>
              <Code>{row.proposal_slug}</Code>
              {row.proposal_panel_name ? (
                <span className="text-quaternary">
                  {translate('Panel: {name}', {
                    name: row.proposal_panel_name,
                  })}
                </span>
              ) : null}
            </div>
          ),
          width: '28%',
          ellipsis: false,
        },
        {
          title: translate('Final score'),
          orderField: 'final_score',
          export: (row) => row.final_score ?? DASH_ESCAPE_CODE,
          render: ({ row }) => (
            <InlineNumberCell
              value={row.final_score}
              label={translate('Final score')}
              editable={editable}
              onSave={(score) => update(row, { final_score: score })}
            />
          ),
          width: '14%',
          ellipsis: false,
        },
        {
          title: translate('Recommended resources'),
          export: (row) =>
            getNamedRecommendation(row)
              .map((entry) =>
                entry.offering
                  ? `${entry.offering}: ${entry.amounts}`
                  : entry.amounts,
              )
              .join('; ') || DASH_ESCAPE_CODE,
          render: RecommendationCell,
          width: '26%',
          ellipsis: false,
        },
        {
          title: translate('Notes'),
          export: (row) => row.notes || DASH_ESCAPE_CODE,
          render: ({ row }) => (
            <span className="line-clamp-3 wrap-anywhere" title={row.notes}>
              {renderFieldOrDash(row.notes)}
            </span>
          ),
          width: '22%',
          ellipsis: false,
        },
      ]}
      rowActions={rowActions}
      enableExport
      fullExport={fullExport}
      tableActions={
        <div className="flex flex-wrap gap-1.5">
          {canEdit ? (
            <>
              <BaseButton
                label={translate('Import CSV')}
                iconNode={<UploadSimpleIcon weight="bold" />}
                onClick={openImport}
                variant="tertiary"
                size={report ? undefined : 'sm'}
                disabled={locked}
                tooltip={locked ? lockedReason : undefined}
              />
              <BaseButton
                label={translate('Rank proposal')}
                iconNode={<PlusCircleIcon weight="bold" />}
                onClick={openAdd}
                variant="tertiary"
                size={report ? undefined : 'sm'}
                disabled={locked || !choices.isSuccess || !unranked.length}
                tooltip={
                  locked
                    ? lockedReason
                    : !choices.isSuccess
                      ? choices.isError
                        ? translate(
                            'Unable to load the proposals of the round.',
                          )
                        : translate('Loading the proposals of the round…')
                      : !unranked.length
                        ? report
                          ? translate(
                              'Every proposal the report covers is ranked.',
                            )
                          : translate(
                              'Every proposal being evaluated in this round is ranked.',
                            )
                        : undefined
                }
              />
            </>
          ) : null}
        </div>
      }
    />
  );
};
