import {
  ArrowCounterClockwiseIcon,
  ArrowSquareOutIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  PlusCircleIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import {
  RoundMeetingNote,
  roundMeetingNotesDestroy,
  roundMeetingNotesList,
  roundMeetingNotesReopen,
} from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { RoundReportStatus } from './RoundReportStatus';

const MeetingNoteFormDialog = lazyComponent(() =>
  import('./MeetingNoteFormDialog').then((m) => ({
    default: m.MeetingNoteFormDialog,
  })),
);

interface RoundMeetingNotesPanelProps {
  round: { uuid: string; name: string };
  /** The call's managers write notes; panel members read them. */
  canEdit: boolean;
  /** Called when a round report is reopened, so the round's counts follow. */
  onReportChange?(): void;
}

const ReportStatus: FC<{ row: RoundMeetingNote }> = ({ row }) => (
  <span className="flex flex-wrap items-center gap-1.5">
    <Badge variant="info" size="sm" shape="pill" tone="outline">
      {translate('Round report: {step}', { step: row.call_step_name })}
    </Badge>
    <RoundReportStatus submittedAt={row.submitted_at} />
    <span className="text-quaternary">
      {translate('{count} proposal(s)', {
        count: row.report_proposals?.length ?? 0,
      })}
    </span>
  </span>
);

const NoteCell: FC<{ row: RoundMeetingNote }> = ({ row }) => (
  <div className="flex flex-col gap-1">
    <span className="font-semibold wrap-anywhere">{row.title}</span>
    {row.is_report ? <ReportStatus row={row} /> : null}
    {row.body ? (
      <span className="wrap-anywhere whitespace-pre-wrap">{row.body}</span>
    ) : null}
  </div>
);

const DocumentsCell: FC<{ row: RoundMeetingNote }> = ({ row }) =>
  row.documents?.length ? (
    <div className="flex flex-col gap-1">
      {row.documents.map((document) => (
        <FileDownloader
          key={document.uuid}
          url={document.file}
          name={document.name}
          className="text-btn hover:text-brand inline-flex items-center"
        >
          <DownloadSimpleIcon weight="bold" className="me-1" />
          {document.name}
        </FileDownloader>
      ))}
    </div>
  ) : (
    <>{renderFieldOrDash(null)}</>
  );

const NoteActions: FC<{
  row: RoundMeetingNote;
  round: RoundMeetingNotesPanelProps['round'];
  canEdit: boolean;
  refetch(): void;
}> = ({ row, round, canEdit, refetch }) => {
  const { openDialog } = useModal();
  const router = useRouter();
  const reopen = useManagedMutation<any, any, void>({
    mutationFn: () => roundMeetingNotesReopen({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Reopen round report'),
      body: translate(
        'Hand "{title}" back to its author? Proposals that reached the step after it was submitted join it.',
        { title: row.title },
      ),
    },
    successMessage: translate('The round report has been reopened.'),
    errorMessage: translate('Unable to reopen the round report.'),
    refetch,
  });
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () => roundMeetingNotesDestroy({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Delete meeting note'),
      body: translate('Delete the note "{title}" and its documents?', {
        title: row.title,
      }),
    },
    successMessage: translate('The meeting note has been deleted.'),
    errorMessage: translate('Unable to delete the meeting note.'),
    refetch,
  });
  if (row.is_report) {
    return (
      <ActionsDropdown row={row}>
        <ActionItem
          title={translate('Open report')}
          iconNode={<ArrowSquareOutIcon weight="bold" />}
          action={() =>
            router.stateService.go('round-report', { report_uuid: row.uuid })
          }
        />
        {canEdit && row.submitted_at ? (
          <ActionItem
            title={translate('Reopen')}
            iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
            action={() => reopen.mutate()}
            disabled={reopen.isPending}
          />
        ) : null}
        {canEdit && !row.submitted_at && !row.report_proposals?.length ? (
          <RemovalActionItem
            title={translate('Delete')}
            action={() => remove.mutate()}
            disabled={remove.isPending}
          />
        ) : null}
      </ActionsDropdown>
    );
  }
  return (
    <ActionsDropdown row={row}>
      <ActionItem
        title={translate('Edit')}
        iconNode={<PencilSimpleIcon weight="bold" />}
        action={() =>
          openDialog(MeetingNoteFormDialog, {
            resolve: {
              roundUuid: round.uuid,
              roundName: round.name,
              note: row,
              refetch,
            },
            size: 'lg',
          })
        }
      />
      <RemovalActionItem
        title={translate('Delete')}
        action={() => remove.mutate()}
        disabled={remove.isPending}
      />
    </ActionsDropdown>
  );
};

/** Committee and panel feedback recorded on the round's cut-off. */
export const RoundMeetingNotesPanel: FC<RoundMeetingNotesPanelProps> = ({
  round,
  canEdit,
  onReportChange,
}) => {
  const { openDialog } = useModal();
  const filter = useMemo(() => ({ round_uuid: round.uuid }), [round.uuid]);
  const tableProps = useTable({
    table: `RoundMeetingNotes-${round.uuid}`,
    fetchData: createFetcher(roundMeetingNotesList),
    filter,
  });
  const refetch = useCallback(() => {
    tableProps.fetch();
    onReportChange?.();
  }, [tableProps.fetch, onReportChange]);

  // A round report opens on its own page for whoever reads it; free notes
  // are the call's managers' to edit.
  const rowActions = useCallback(
    ({ row }: { row: RoundMeetingNote }) =>
      canEdit || row.is_report ? (
        <NoteActions
          row={row}
          round={round}
          canEdit={canEdit}
          refetch={refetch}
        />
      ) : null,
    [canEdit, round, refetch],
  );

  const openAdd = useCallback(
    () =>
      openDialog(MeetingNoteFormDialog, {
        resolve: { roundUuid: round.uuid, roundName: round.name, refetch },
        size: 'lg',
      }),
    [openDialog, round.uuid, round.name, refetch],
  );

  return (
    <Table<RoundMeetingNote>
      {...tableProps}
      id={`round-meeting-notes-${round.uuid}`}
      title={translate('Meeting notes')}
      hideTitle
      headerClassName="min-h-[40px] py-0"
      verboseName={translate('meeting notes')}
      emptyMessage={translate('No meeting note is recorded for this round.')}
      columns={[
        {
          title: translate('Note'),
          render: NoteCell,
          width: '50%',
          ellipsis: false,
        },
        {
          title: translate('Documents'),
          render: DocumentsCell,
          width: '20%',
          ellipsis: false,
        },
        {
          title: translate('Author'),
          render: ({ row }) => <>{renderFieldOrDash(row.author_name)}</>,
          width: '15%',
        },
        {
          title: translate('Recorded'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          width: '15%',
        },
      ]}
      rowActions={rowActions}
      tableActions={
        canEdit ? (
          <BaseButton
            label={translate('Add note')}
            iconNode={<PlusCircleIcon weight="bold" />}
            onClick={openAdd}
            variant="tertiary"
            size="sm"
          />
        ) : undefined
      }
    />
  );
};
