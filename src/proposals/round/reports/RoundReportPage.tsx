import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FC, useCallback } from 'react';
import {
  roundMeetingNotesRetrieve,
  roundMeetingNotesSubmit,
} from 'waldur-js-client';

import { AlertItem, BaseButton, Code } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { useTitle } from '@/navigation/title';
import { RoundReportStatus } from '@/proposals/round/meeting-notes/RoundReportStatus';
import { RoundRankingTable } from '@/proposals/round/ranking/RoundRankingTable';

import { RoundReportChecklist } from './RoundReportChecklist';

const MeetingNoteFormDialog = lazyComponent(() =>
  import('@/proposals/round/meeting-notes/MeetingNoteFormDialog').then((m) => ({
    default: m.MeetingNoteFormDialog,
  })),
);

const roundReportKey = (uuid: string) => ['round-report', uuid] as const;

/**
 * A round report: one person's work on a step run once per round, covering
 * the proposals of the round they hold it for. Its author writes the
 * meeting's notes, answers the step's form, ranks the proposals it covers
 * and submits it; once every report covering a proposal is in, the step is
 * done for that proposal.
 */
export const RoundReportPage: FC = () => {
  const {
    params: { report_uuid },
  } = useCurrentStateAndParams();
  const { openDialog } = useModal();
  const {
    data,
    isLoading,
    error,
    refetch: refetchReport,
  } = useQuery({
    queryKey: roundReportKey(report_uuid),
    queryFn: () =>
      roundMeetingNotesRetrieve({ path: { uuid: report_uuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
  useTitle(data?.title ?? translate('Round report'));
  const refetch = useCallback(() => {
    void refetchReport();
  }, [refetchReport]);

  const submit = useManagedMutation<any, any, void>({
    mutationFn: () => roundMeetingNotesSubmit({ path: { uuid: report_uuid } }),
    confirmation: {
      title: translate('Submit round report'),
      body: translate(
        'Once submitted, the report and its ranking can no longer be changed unless the call managers reopen it.',
      ),
    },
    successMessage: translate('The round report has been submitted.'),
    errorMessage: translate('Unable to submit the round report.'),
    refetch,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }
  const canEdit = Boolean(data.can_edit);
  return (
    <div
      className={classNames(
        PAGE_CONTAINER_CLASSNAME,
        'max-w-[1320px] py-6 flex flex-col gap-5',
      )}
    >
      <Panel
        title={<span className="wrap-anywhere">{data.title}</span>}
        subtitle={
          <span className="flex flex-col items-start gap-1.5">
            <span>
              {translate('{step} — {call}, {round}', {
                step: data.call_step_name,
                call: data.call_name,
                round: data.round_name,
              })}
            </span>
            <RoundReportStatus submittedAt={data.submitted_at} />
          </span>
        }
        actions={
          canEdit ? (
            <div className="flex flex-wrap items-start gap-1.5">
              <BaseButton
                label={translate('Edit notes')}
                variant="tertiary"
                onClick={() =>
                  openDialog(MeetingNoteFormDialog, {
                    resolve: {
                      roundUuid: data.round_uuid,
                      roundName: data.round_name,
                      note: data,
                      refetch,
                    },
                    size: 'lg',
                  })
                }
              />
              <BaseButton
                label={translate('Submit report')}
                variant="primary"
                pending={submit.isPending}
                onClick={() => submit.mutate()}
              />
            </div>
          ) : null
        }
      >
        {data.body ? (
          <p className="mb-5 wrap-anywhere" style={{ whiteSpace: 'pre-wrap' }}>
            {data.body}
          </p>
        ) : null}
        <div className="font-medium text-quaternary mb-1.5">
          {translate('Proposals covered')}
        </div>
        {data.report_proposals?.length ? (
          <ul className="mb-0" data-testid="report-proposals">
            {data.report_proposals.map((proposal) => (
              <li key={proposal.uuid}>
                {proposal.name} <Code className="text-xs">{proposal.slug}</Code>
              </li>
            ))}
          </ul>
        ) : (
          <AlertItem
            type="floating"
            variant="info"
            title={translate('The report covers no proposal.')}
          />
        )}
      </Panel>
      {data.has_checklist ? (
        <Panel>
          <RoundReportChecklist reportUuid={data.uuid} canEdit={canEdit} />
        </Panel>
      ) : null}
      <Panel>
        <RoundRankingTable
          round={{ uuid: data.round_uuid, name: data.round_name }}
          canEdit={canEdit}
          report={{
            uuid: data.uuid,
            proposals: data.report_proposals ?? [],
          }}
        />
      </Panel>
    </div>
  );
};
