import { FC, useMemo, useState } from 'react';
import { WorkflowVersion } from 'waldur-js-client';

import { AlertItem, BaseButton, Select } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import {
  useCallWorkflowDescription,
  useCallWorkflowDiff,
  useCallWorkflowVersions,
  useTemplateWorkflowDescription,
} from '@/proposals/workflow-description/queries';
import { useValidationTableExport } from '@/proposals/workflow-description/validationExport';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';

import { WorkflowDiffView } from './WorkflowDiffView';

const reasonLabel = (reason: WorkflowVersion['reason']): string =>
  ({
    created: translate('Created'),
    created_from_template: translate('Created from a template'),
    imported: translate('Imported'),
    duplicated: translate('Duplicated'),
    edited: translate('Edited'),
    activated: translate('Activated'),
  })[reason] ?? reason;

/** What a version changed from the one before it; the first is where the
 * history starts, so it changed nothing. */
const versionChanges = (version: WorkflowVersion): string => {
  const summary = version.summary;
  if (summary.behaviour === undefined) {
    return version.number === 1
      ? translate('First version')
      : translate('No changes recorded');
  }
  if (!summary.behaviour && !summary.cosmetic) {
    return translate('No changes');
  }
  return translate('{behaviour} behavioral, {cosmetic} cosmetic', {
    behaviour: summary.behaviour ?? 0,
    cosmetic: summary.cosmetic ?? 0,
  });
};

/** What the call changed from the template it was created from. */
const ChangesFromTemplate: FC<{ call: Call }> = ({ call }) => {
  const [showTemplateUpdate, setShowTemplateUpdate] = useState(false);
  const { data, isLoading } = useCallWorkflowDiff(
    call.uuid,
    'template',
    'current',
  );
  const newerTemplate =
    call.template_latest_version != null &&
    call.template_version != null &&
    call.template_latest_version > call.template_version;
  const templateUpdate = useCallWorkflowDiff(
    call.uuid,
    'template',
    'template_latest',
    showTemplateUpdate,
  );
  // The template's description is the baseline's only while the template
  // has not changed since the call was created from it.
  const { data: templateDescription } = useTemplateWorkflowDescription(
    newerTemplate ? undefined : (call.template_uuid ?? undefined),
  );
  const { data: callDescription } = useCallWorkflowDescription(call.uuid);
  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;
  return (
    <>
      {newerTemplate && (
        <AlertItem
          variant="info"
          className="mb-3"
          title={translate(
            'The template "{name}" has changed since this call was created from it: version {latest}, the call started from version {version}.',
            {
              name: call.template_name,
              latest: call.template_latest_version,
              version: call.template_version,
            },
          )}
          actions={
            <BaseButton
              variant="tertiary"
              size="sm"
              label={
                showTemplateUpdate
                  ? translate("Hide the template's changes")
                  : translate("Show the template's changes")
              }
              onClick={() => setShowTemplateUpdate((shown) => !shown)}
            />
          }
        />
      )}
      {showTemplateUpdate && templateUpdate.data && (
        <div className="mb-5">
          <h5>{translate("The template's own changes since")}</h5>
          <WorkflowDiffView changes={templateUpdate.data.changes} />
        </div>
      )}
      <WorkflowDiffView
        changes={data.changes}
        before={templateDescription}
        after={callDescription}
        emptyText={translate('No behavioral changes from the template.')}
      />
    </>
  );
};

const VersionsTable: FC<{ versions: WorkflowVersion[] }> = ({ versions }) => {
  const rows = useMemo(() => [...versions].reverse(), [versions]);
  const tableProps = useRowsTable('WorkflowVersions', rows, rows);
  const exportProps = useValidationTableExport();
  const columns: Column<WorkflowVersion>[] = [
    {
      title: translate('Version'),
      export: (row) => row.number,
      render: ({ row }) => row.number,
    },
    {
      title: translate('Saved'),
      export: (row) => formatDateTime(row.modified),
      render: ({ row }) => formatDateTime(row.modified),
    },
    {
      title: translate('By'),
      export: (row) => row.created_by_name ?? translate('System'),
      render: ({ row }) =>
        row.created_by_name ?? (
          <span className="text-quaternary">{translate('System')}</span>
        ),
    },
    {
      title: translate('Reason'),
      export: (row) => reasonLabel(row.reason),
      render: ({ row }) => reasonLabel(row.reason),
    },
    {
      title: translate('Changes'),
      export: versionChanges,
      render: ({ row }) => (
        <span className={row.summary.behaviour ? undefined : 'text-quaternary'}>
          {versionChanges(row)}
        </span>
      ),
    },
  ];
  return (
    <Table<WorkflowVersion>
      {...tableProps}
      {...exportProps}
      showPageSizeSelector
      columns={columns}
      verboseName={translate('Versions')}
      hideTitle
      hasActionBar={false}
      cardBordered={false}
      bodyClassName="p-0"
      minHeight="auto"
      placeholderHasRetry={false}
    />
  );
};

/** The call's workflow versions, and the changes between any two. */
const History: FC<{ call: Call }> = ({ call }) => {
  const { data: versions, isLoading } = useCallWorkflowVersions(call.uuid);
  if (isLoading) return <LoadingSpinner />;
  if (!versions) return null;
  return <VersionsTable key={versions.length} versions={versions} />;
};

const CompareVersions: FC<{ call: Call }> = ({ call }) => {
  const { data: versions, isLoading } = useCallWorkflowVersions(call.uuid);
  const options = useMemo(
    () => [
      { value: 'current', label: translate('Current') },
      ...(call.template_uuid
        ? [{ value: 'template', label: translate('Template') }]
        : []),
      ...[...(versions ?? [])].reverse().map((version) => ({
        value: String(version.number),
        label: translate('Version {number}', { number: version.number }),
      })),
    ],
    [versions, call.template_uuid],
  );
  const latest = versions?.length ? versions[versions.length - 1].number : 0;
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState('current');
  const fromValue = from ?? (latest > 1 ? String(latest - 1) : '1');
  const diff = useCallWorkflowDiff(call.uuid, fromValue, to, latest > 0);
  if (isLoading) return <LoadingSpinner />;
  if (!versions) return null;
  // Comparing needs two sides: two versions, or a version and the template.
  const canCompare = latest > 1 || Boolean(call.template_uuid);
  return (
    <div data-testid="workflow-compare">
      {canCompare ? (
        <>
          <div className="flex flex-wrap items-end gap-2.5 mb-4">
            <div className="grow max-w-[260px]">
              <div className="text-xs text-quaternary mb-1">
                {translate('From')}
              </div>
              <Select
                aria-label={translate('From')}
                options={options}
                value={options.find((option) => option.value === fromValue)}
                onChange={(option: any) => setFrom(option?.value ?? null)}
                isClearable={false}
                isSearchable={false}
              />
            </div>
            <div className="grow max-w-[260px]">
              <div className="text-xs text-quaternary mb-1">
                {translate('To')}
              </div>
              <Select
                aria-label={translate('To')}
                options={options}
                value={options.find((option) => option.value === to)}
                onChange={(option: any) => setTo(option?.value ?? 'current')}
                isClearable={false}
                isSearchable={false}
              />
            </div>
          </div>
          {diff.isLoading ? (
            <LoadingSpinner />
          ) : diff.data ? (
            <WorkflowDiffView changes={diff.data.changes} />
          ) : null}
        </>
      ) : (
        <p className="text-quaternary mb-0">
          {latest
            ? translate(
                'Only one version is saved so far. Each change to the steps or settings saves a new version, which can then be compared with this one.',
              )
            : translate(
                'No version is saved yet. Each change to the steps or settings saves one.',
              )}
        </p>
      )}
    </div>
  );
};

/**
 * Where the call's workflow came from and how it changed: the changes from
 * its template, and its version history.
 */
export const changesViews = (call: Call) =>
  [
    {
      value: 'template',
      label: translate('Changes from template'),
      intro: translate(
        'Created from the template "{name}": what changed from it.',
        { name: call.template_name },
      ),
      hidden: !call.template_uuid,
    },
    {
      value: 'history',
      label: translate('History'),
      intro: translate('Every saved version of the workflow.'),
    },
    {
      value: 'compare',
      label: translate('Compare versions'),
      intro: translate(
        'Pick two versions to see what changed between them, step by step.',
      ),
    },
  ].filter((view) => !view.hidden);

export const WorkflowChangesSection: FC<{ call: Call; view: string }> = ({
  call,
  view,
}) => (
  <section data-testid="workflow-changes">
    {view === 'template' ? (
      <ChangesFromTemplate call={call} />
    ) : view === 'compare' ? (
      <CompareVersions call={call} />
    ) : (
      <History call={call} />
    )}
  </section>
);
