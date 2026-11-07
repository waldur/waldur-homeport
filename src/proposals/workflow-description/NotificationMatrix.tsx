import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import {
  WorkflowDescription,
  WorkflowDescriptionAlwaysSent,
  WorkflowDescriptionFlag,
  WorkflowDescriptionRule,
} from 'waldur-js-client';

import {
  Badge,
  PropertyItem,
  PropertyList,
  Tabs,
  TabsItem,
  Tooltip,
} from 'waldur-ui';

import { translate } from '@/i18n';
import {
  DISABLED_STEP_ROW_CLASS,
  DisabledStepBadge,
} from '@/proposals/workflow/StepGroupHeader';
import {
  severityLabel,
  severityVariant,
} from '@/proposals/workflow-check/findings';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';

import { explainRef } from './explain';
import { RECIPIENTS, recipientLabel, triggerLabel } from './mail/labels';
import { MailTarget } from './mail/queries';
import { useOpenMailDialog } from './mail/useOpenMailDialog';
import {
  notificationMatrixExportFields,
  notificationMatrixExportRows,
  NotificationMatrixRow,
  notificationMatrixRows,
} from './matrixExport';
import { actorLabel } from './summary';
import { useValidationTableExport } from './validationExport';

const alwaysSentLabel = (event: string): string =>
  ({
    proposal_decided: translate('Proposal accepted or rejected'),
    proposal_cancelled: translate('Proposal canceled'),
    draft_carried_over: translate('Draft carried over to the next round'),
    submission_deadline_approaching: translate(
      'Submission deadline approaching',
    ),
    proposal_submitted: translate('Proposal submitted'),
    proposal_withdrawn: translate('Proposal withdrawn'),
    review_submitted: translate('Review submitted'),
    review_declined: translate('Review declined'),
    reviews_completed: translate('All reviews in'),
    round_adopted: translate("Round's results adopted"),
    round_cutoff: translate('Round cut-off'),
    offering_request_decided: translate('Offering request decided'),
    offering_requested: translate('Offering requested from its provider'),
    assignment_batch_expired: translate('Assignment batch expired'),
    pool_invitation_expired: translate('Reviewer pool invitation expired'),
    review_assigned: translate('Review assigned'),
    review_deadline_approaching: translate('Review deadline approaching'),
    proposal_decided_for_reviewer: translate('Decision on a reviewed proposal'),
    round_started: translate('Round started'),
    pool_invitation: translate('Reviewer pool invitation'),
    assignment_batch_sent: translate('Assignment batch sent'),
    assignment_expiring: translate('Assignment expiring'),
    evaluator_role_changed: translate('Evaluator role given or taken away'),
    contribution_delegated: translate('Contribution handed on'),
    change_request: translate('Request for changes'),
    changes_submitted: translate('Changes submitted'),
    round_step_opened: translate('Round step opened'),
    round_report_requested: translate('Round report requested'),
    round_report_due: translate('Round report due'),
    offering_round_opened: translate('Round opened, to the offering team'),
    offering_team_digest: translate("Daily digest of the offering team's work"),
    call_offering_terms_changed: translate(
      'What the call asks of the offering changed',
    ),
    award_provision_failed: translate('Awarded item could not be provisioned'),
    call_manager_message: translate(
      "A call manager's own message to chosen proposals",
    ),
  })[event] ?? event;

/** What a notification sub-tab shows, in a line. */
export const notificationTabIntro = (value: string): string =>
  ({
    rules: translate('Who is mailed on each event of each step.'),
    flags: translate('What looks wrong in the notification rules.'),
    'always-sent': translate('Mail sent whatever the rules say.'),
  })[value];

const CustomisedMark: FC = () => (
  <Badge
    variant="neutral"
    size="sm"
    shape="pill"
    tone="outline"
    data-testid="mail-customised"
  >
    {translate('Customized')}
  </Badge>
);

const mailTypeLabel = (key: string): string =>
  ({
    'workflow_step_event:applicant': translate('To the applicant'),
    'workflow_step_event:call_team': translate('To the call team'),
    proposal_role_assigned: translate('Role given'),
    proposal_role_revoked: translate('Role taken away'),
  })[key] ?? translate('Mail');

type MatrixRow = NotificationMatrixRow;

const ruleLabel = (rule: WorkflowDescriptionRule): string =>
  (rule.proposal_role || translate('Mail')) +
  (rule.enabled ? '' : ` (${translate('disabled')})`);

const RuleCell: FC<{
  rules: WorkflowDescriptionRule[];
  onOpen?(rule: WorkflowDescriptionRule): void;
}> = ({ rules, onOpen }) => (
  <div className="flex flex-col items-start gap-1">
    {rules.map((rule, index) => (
      <span
        key={index}
        className="inline-flex items-center gap-1"
        data-testid="notification-rule"
      >
        <Tooltip
          label={
            rule.actors.length
              ? translate('Mail {template} to {who}. Click to see it.', {
                  template: 'workflow_step_event',
                  who: rule.actors.join(', '),
                })
              : translate('Resolves to nobody on this call.')
          }
        >
          {onOpen ? (
            <button
              type="button"
              className="text-anchor"
              aria-label={translate('Open the mail')}
              onClick={() => onOpen(rule)}
            >
              {ruleLabel(rule)}
            </button>
          ) : (
            <span>{ruleLabel(rule)}</span>
          )}
        </Tooltip>
        {rule.customised && <CustomisedMark />}
      </span>
    ))}
  </div>
);

/** Why a rule was flagged, and what it rests on. */
const whyText = (
  flag: WorkflowDescriptionFlag,
  description: WorkflowDescription,
): string =>
  [flag.message, ...flag.because.map((ref) => explainRef(ref, description))]
    .filter(Boolean)
    .join(' ');

const FlagsList: FC<{
  flags: WorkflowDescriptionFlag[];
  description: WorkflowDescription;
}> = ({ flags, description }) => {
  const tableProps = useRowsTable('WorkflowNotificationFlags', flags, flags);
  const exportProps = useValidationTableExport();
  const names = new Map(description.steps.map((s) => [s.key, s.name]));
  const kindLabel = (kind: string) =>
    ({
      missing: translate('Nobody is told'),
      duplicate: translate('Told twice'),
      unreachable: translate('Reaches nobody'),
      leak_risk: translate('May tell the applicant too much'),
    })[kind] ?? kind;
  const columns: Column<WorkflowDescriptionFlag>[] = [
    {
      title: translate('Problem'),
      // Four short columns, spread evenly across the table.
      width: '25%',
      export: (row) =>
        `${kindLabel(row.kind)} (${
          row.severity === 'warning' ? translate('warning') : translate('note')
        })`,
      render: ({ row }) => (
        <span className="text-primary">{kindLabel(row.kind)}</span>
      ),
    },
    {
      title: translate('Step'),
      width: '25%',
      export: (row) => (row.step ? (names.get(row.step) ?? row.step) : ''),
      render: ({ row }) => (
        <>{row.step ? (names.get(row.step) ?? row.step) : ''}</>
      ),
    },
    {
      title: translate('When'),
      width: '25%',
      export: (row) => (row.trigger ? triggerLabel(row.trigger) : ''),
      render: ({ row }) => <>{row.trigger ? triggerLabel(row.trigger) : ''}</>,
    },
    {
      title: translate('Severity'),
      width: '25%',
      export: (row) => severityLabel(row.severity),
      render: ({ row }) => (
        <Badge
          variant={severityVariant(row.severity)}
          size="sm"
          shape="pill"
          tone="outline"
        >
          {severityLabel(row.severity)}
        </Badge>
      ),
    },
    {
      title: translate('Why'),
      // Shown in the expanded row; kept here for the export.
      visible: false,
      export: (row) => whyText(row, description),
      render: ({ row }) => <>{whyText(row, description)}</>,
    },
  ];
  return (
    <section data-testid="notification-flags">
      <Table<WorkflowDescriptionFlag>
        {...tableProps}
        {...exportProps}
        showPageSizeSelector
        columns={columns}
        verboseName={translate('Rules to look at')}
        hideTitle
        hasActionBar={false}
        cardBordered={false}
        bodyClassName="p-0"
        className="[&_.table-responsive]:[container-type:inline-size]"
        placeholderHasRetry={false}
        expandableRow={({ row }) => (
          <ExpandableContainer className="fluid">
            {/* Wraps to the width the table shows; see FindingDetails. */}
            <div className="sticky left-0 w-[calc(100cqw-64px)]">
              <PropertyList variant="summary" termWidth="120px">
                <PropertyItem
                  label={translate('Why')}
                  value={whyText(row, description)}
                />
              </PropertyList>
            </div>
          </ExpandableContainer>
        )}
      />
    </section>
  );
};

const audienceText = (row: WorkflowDescriptionAlwaysSent) =>
  row.audience
    .map((kind) =>
      kind === 'step_actor' ? translate("the step's actor") : actorLabel(kind),
    )
    .join(', ');

const AlwaysSentList: FC<{
  mails: WorkflowDescriptionAlwaysSent[];
  onOpen?(target: MailTarget): void;
}> = ({ mails, onOpen }) => {
  const tableProps = useRowsTable('WorkflowAlwaysSentMail', mails, mails);
  const exportProps = useValidationTableExport();
  const columns: Column<WorkflowDescriptionAlwaysSent>[] = [
    {
      title: translate('Mail'),
      export: (row) =>
        row.customised
          ? `${alwaysSentLabel(row.event)} (${translate('Customized')})`
          : alwaysSentLabel(row.event),
      render: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-primary">
          {alwaysSentLabel(row.event)}
          {row.customised && <CustomisedMark />}
        </span>
      ),
    },
    {
      title: translate('Audience'),
      export: audienceText,
      render: ({ row }) => <>{audienceText(row)}</>,
    },
    ...(onOpen
      ? [
          {
            id: 'open',
            title: translate('See or customize'),
            export: false,
            render: ({ row }: { row: WorkflowDescriptionAlwaysSent }) =>
              row.mail_types.length ? (
                <div className="flex flex-wrap gap-1">
                  {row.mail_types.map((key) => {
                    const [mailType, variant = ''] = key.split(':');
                    return (
                      <button
                        key={key}
                        type="button"
                        className="text-anchor"
                        onClick={() => onOpen({ mailType, variant })}
                      >
                        {row.mail_types.length > 1
                          ? mailTypeLabel(key)
                          : translate('Mail')}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>{translate('Worded by the portal')}</>
              ),
          },
        ]
      : []),
  ];
  return (
    <section data-testid="always-sent-mail">
      <Table<WorkflowDescriptionAlwaysSent>
        {...tableProps}
        {...exportProps}
        showPageSizeSelector
        columns={columns}
        verboseName={translate('Mails')}
        hideTitle
        hasActionBar={false}
        cardBordered={false}
        bodyClassName="p-0"
        placeholderHasRetry={false}
      />
    </section>
  );
};

interface NotificationMatrixProps {
  description: WorkflowDescription;
  hideDisabled?: boolean;
  /** The call the mails are of; the page's call when left out. */
  callUuid?: string;
}

/**
 * The sub-tabs of the notification matrix: the rules by step and event
 * against audience, the flags raised over them and the mail sent regardless
 * of rules. For a page that draws the tab strip itself, e.g. in its header.
 */
export const useNotificationTabs = ({
  description,
  hideDisabled,
  callUuid,
}: NotificationMatrixProps): TabsItem[] => {
  const { params } = useCurrentStateAndParams();
  const openMail = useOpenMailDialog(callUuid ?? params.call_uuid);
  const onOpen = callUuid || params.call_uuid ? openMail : undefined;
  const rows = useMemo(
    () => notificationMatrixRows(description, hideDisabled),
    [description, hideDisabled],
  );
  const tableProps = useRowsTable('WorkflowNotificationMatrix', rows, rows, {
    exportFields: notificationMatrixExportFields,
    exportData: notificationMatrixExportRows,
  });
  const exportProps = useValidationTableExport();
  // One set of columns while the opener stays the same: new render
  // functions would remount every cell on each render, and the "Open the
  // mail" button focused when the dialog opened would be gone when it closes,
  // dropping focus to the page instead of back on it.
  const columns = useMemo<Column<MatrixRow>[]>(
    () => [
      {
        title: translate('Step'),
        rowHeader: true,
        render: ({ row }) => (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span className="text-primary">{row.stepName}</span>
            {!row.stepEnabled && <DisabledStepBadge />}
          </span>
        ),
      },
      {
        title: translate('Event'),
        render: ({ row }) => <>{triggerLabel(row.trigger, row.daysBefore)}</>,
      },
      ...RECIPIENTS.map((recipient) => ({
        id: recipient,
        title: recipientLabel(recipient),
        // The mails are buttons: an ellipsis cell clips their focus ring.
        ellipsis: false,
        render: ({ row }: { row: MatrixRow }) => (
          <RuleCell
            rules={row.rules.filter((rule) => rule.recipient === recipient)}
            onOpen={
              onOpen
                ? (rule) =>
                    onOpen({
                      step: row.stepKey,
                      stepName: row.stepName,
                      trigger: rule.trigger,
                      recipient: rule.recipient,
                      daysBefore: rule.days_before,
                    })
                : undefined
            }
          />
        ),
      })),
    ],
    [onOpen],
  );
  const flags = description.notifications.flags;
  const warnings = flags.filter((flag) => flag.severity === 'warning').length;
  return [
    {
      value: 'rules',
      title: translate('Rules'),
      content: (
        <section data-testid="notification-rules">
          <Table<MatrixRow>
            {...tableProps}
            {...exportProps}
            showPageSizeSelector
            columns={columns}
            verboseName={translate('Notification rules')}
            rowClass={({ row }) =>
              row.stepEnabled ? '' : DISABLED_STEP_ROW_CLASS
            }
            hideTitle
            hasActionBar={false}
            cardBordered={false}
            bodyClassName="p-0"
            placeholderHasRetry={false}
          />
        </section>
      ),
    },
    {
      value: 'flags',
      title: translate('To look at'),
      // The warnings, as the page's tab counts them; the notes only
      // when there is nothing more pressing.
      count: warnings || flags.length,
      // Coloured like the page's tab while there are warnings; notes
      // alone are a plain tally.
      countVariant: warnings ? 'warning' : 'neutral',
      countLabel: warnings
        ? warnings === 1
          ? translate('1 warning')
          : translate('{count} warnings', { count: warnings })
        : flags.length === 1
          ? translate('1 note')
          : translate('{count} notes', { count: flags.length }),
      // Left out when the rules raise nothing.
      hidden: flags.length === 0,
      content: <FlagsList flags={flags} description={description} />,
    },
    {
      value: 'always-sent',
      title: translate('Always sent'),
      content: (
        <AlwaysSentList
          mails={description.notifications.always_sent}
          onOpen={onOpen}
        />
      ),
    },
  ];
};

/**
 * Every notification rule of the call, by step and event against audience,
 * with the flags raised over them and the mail sent regardless of rules.
 */
export const NotificationMatrix: FC<NotificationMatrixProps> = (props) => (
  <Tabs
    defaultValue="rules"
    listProps={{ variant: 'segmented', className: 'mb-3' }}
    items={useNotificationTabs(props)}
  />
);
