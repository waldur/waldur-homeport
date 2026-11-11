import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { WorkflowCheck, WorkflowCheckFinding } from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { StepFormPage } from '@/proposals/update/workflow-steps/stepForm';
import { useValidationTableExport } from '@/proposals/workflow-description/validationExport';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  findingTarget,
  findingWhere,
  severityLabel,
  severityVariant,
  sortFindings,
  summaryText,
} from './findings';

export type OpenStepAt = (
  stepKey: string,
  page: StepFormPage,
  field?: string,
) => void;

/** The call's Validation page, between Manage and Edit. */
export const CALL_VALIDATION_STATE = 'protected-call.validation';

/** The states of the call's pages whose tabs hold the call's settings. */
const CALL_PAGE_STATES = {
  edit: 'protected-call.main',
  manage: 'protected-call.manage',
};

/**
 * Open the tab holding a call-level setting, on the call's Edit or Manage
 * page. Works from any of the call's pages, as all name the call in the URL.
 */
const useOpenCallTab = () => {
  const router = useRouter();
  return useCallback(
    (tab: string, page: keyof typeof CALL_PAGE_STATES = 'edit') =>
      router.stateService.go(CALL_PAGE_STATES[page], { tab }),
    [router],
  );
};

/** Open a section of the call's Validation page. */
export const useOpenValidationTab = () => {
  const router = useRouter();
  return useCallback(
    (tab: string) => router.stateService.go(CALL_VALIDATION_STATE, { tab }),
    [router],
  );
};

interface FindingActionsProps {
  finding: WorkflowCheckFinding;
  onOpenStep?: OpenStepAt;
  /** Shows the notification matrix; without it, the Validation tab's. */
  onOpenNotifications?: () => void;
  onAction?: () => void;
  /** Why a step cannot be opened here, when it cannot. */
  stepUnavailableReason?: string;
}

const FindingActions: FC<FindingActionsProps> = ({
  finding,
  onOpenStep,
  onOpenNotifications,
  onAction,
  stepUnavailableReason,
}) => {
  const openTab = useOpenCallTab();
  const openValidationTab = useOpenValidationTab();
  const target = findingTarget(finding);
  const icon = <ArrowSquareOutIcon weight="bold" />;
  if (!target) {
    // Every row has a menu, so the absence of a fix is said, not implied.
    return (
      <ActionsDropdown>
        <ActionItem
          title={translate('Open setting')}
          action={() => undefined}
          iconNode={icon}
          disabled
          tooltip={translate(
            'This setting is not changed on a page of the call; the finding says what to do.',
          )}
        />
      </ActionsDropdown>
    );
  }
  const run = (action: () => void) => () => {
    onAction?.();
    action();
  };
  if (target.kind === 'notifications') {
    return (
      <ActionsDropdown>
        <ActionItem
          title={translate('Open notification rules')}
          action={run(() =>
            onOpenNotifications
              ? onOpenNotifications()
              : openValidationTab('notifications'),
          )}
          iconNode={icon}
        />
      </ActionsDropdown>
    );
  }
  if (target.kind === 'call') {
    return (
      <ActionsDropdown>
        <ActionItem
          title={translate('Open setting')}
          action={run(() => openTab(target.tab, target.page))}
          iconNode={icon}
        />
      </ActionsDropdown>
    );
  }
  return (
    <ActionsDropdown>
      <ActionItem
        title={target.field ? translate('Open field') : translate('Open step')}
        action={run(() => onOpenStep?.(target.step, target.page, target.field))}
        iconNode={icon}
        disabled={!onOpenStep}
        tooltip={
          onOpenStep
            ? undefined
            : (stepUnavailableReason ??
              translate('Only those who may change the call open its steps.'))
        }
      />
    </ActionsDropdown>
  );
};

// The message wraps to the width the table shows, not the table's own: on a
// narrow screen the table scrolls sideways, and the text would run off it.
// Sized from the scroller (a size container, see the table's class), it also
// leaves the columns' widths alone.
const FindingDetails = ({ row }: { row: WorkflowCheckFinding }) => (
  <ExpandableContainer>
    <div className="sticky left-0 w-[calc(100cqw-64px)]">
      <PropertyList variant="summary" termWidth="120px">
        {/* Where and Setting are columns of the row; the message alone here. */}
        <PropertyItem label={translate('Finding')} value={row.message} />
      </PropertyList>
    </div>
  </ExpandableContainer>
);

/**
 * The findings of a workflow check, errors first. A long message is cut to
 * one line and shown in full in the expanded row; each row's menu opens the
 * setting that fixes it.
 */
export const FindingsTable: FC<
  Omit<FindingActionsProps, 'finding'> & {
    findings: WorkflowCheckFinding[];
  }
> = ({ findings, ...actions }) => {
  const rows = useMemo(() => sortFindings(findings), [findings]);
  const tableProps = useRowsTable('WorkflowCheckFindings', rows, rows);
  const exportProps = useValidationTableExport();
  const columns: Column<WorkflowCheckFinding>[] = [
    {
      title: translate('Problem'),
      export: (row) => row.title,
      render: ({ row }) => (
        <span className="text-primary" data-code={row.code}>
          {row.title}
        </span>
      ),
    },
    {
      title: translate('Where'),
      export: (row) => findingWhere(row).scope,
      render: ({ row }) => <>{findingWhere(row).scope}</>,
    },
    {
      title: translate('Setting'),
      export: (row) => findingWhere(row).setting,
      render: ({ row }) => <>{renderFieldOrDash(findingWhere(row).setting)}</>,
    },
    {
      title: translate('Severity'),
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
      title: translate('Finding'),
      // Shown in the expanded row; kept here for the export.
      visible: false,
      export: (row) => row.message,
      render: ({ row }) => <>{row.message}</>,
    },
  ];
  return (
    <Table<WorkflowCheckFinding>
      {...tableProps}
      {...exportProps}
      showPageSizeSelector
      columns={columns}
      verboseName={translate('Findings')}
      hideTitle
      hasActionBar={false}
      cardBordered={false}
      bodyClassName="p-0"
      className="[&_[data-slot=table-responsive]]:[container-type:inline-size]"
      minHeight="auto"
      placeholderHasRetry={false}
      expandableRow={FindingDetails}
      rowActions={({ row }) => <FindingActions finding={row} {...actions} />}
    />
  );
};

/** Whether the call can be activated, and the counts that say why. */
export const checkVerdict = (check: WorkflowCheck): string => {
  const summary = summaryText(check.summary);
  return check.can_activate
    ? summary
      ? translate(
          'Nothing stops the call from being activated: {summary}, which do not block.',
          { summary },
        )
      : translate('No errors or warnings.')
    : translate(
        'The call cannot be activated until the errors are fixed: {summary}.',
        { summary },
      );
};

/**
 * What the workflow check found: errors stop the call's activation,
 * warnings and notes do not. Each finding opens the setting that fixes it.
 */
export const WorkflowCheckPanel: FC<{
  check: WorkflowCheck;
  /** Whether notes are listed with the errors and warnings. */
  showNotes: boolean;
  onOpenStep?: OpenStepAt;
  onOpenNotifications?: () => void;
  /** A line above the findings, e.g. which sub-tabs have nothing to show. */
  hint?: ReactNode;
}> = ({ check, showNotes, onOpenStep, onOpenNotifications, hint }) => {
  const findings = useMemo(
    () =>
      check.findings.filter(
        (finding) => showNotes || finding.severity !== 'info',
      ),
    [check, showNotes],
  );
  return (
    <section data-testid="workflow-check">
      {hint && <p className="text-quaternary text-xs mb-3">{hint}</p>}
      <FindingsTable
        key={String(showNotes)}
        findings={findings}
        onOpenStep={onOpenStep}
        onOpenNotifications={onOpenNotifications}
      />
    </section>
  );
};
