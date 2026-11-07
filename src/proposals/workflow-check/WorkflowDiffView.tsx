import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import {
  WorkflowChanges,
  WorkflowDescription,
  WorkflowEntityChange,
  WorkflowFieldChange,
} from 'waldur-js-client';

import { Badge, EmptyState } from 'waldur-ui';

import { translate } from '@/i18n';
import { stepFieldLabel } from '@/proposals/workflow-description/explain';
import { StepSummary } from '@/proposals/workflow-description/StepSummary';
import { fromDescription } from '@/proposals/workflow-description/summary';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';
import { renderFieldOrDash } from '@/table/utils';

type Section = 'steps' | 'call' | 'proposal_roles' | 'panels' | 'forms';

interface DiffRow {
  id: string;
  section: Section;
  name: string;
  oldName?: string | null;
  change: WorkflowEntityChange['change'];
  kind: WorkflowFieldChange['kind'];
  stepKey?: string;
  fields: WorkflowFieldChange[];
}

const sectionLabel = (section: Section): string =>
  ({
    steps: translate('Step'),
    call: translate('Call setting'),
    proposal_roles: translate('Evaluator role'),
    panels: translate('Panel'),
    forms: translate('Form'),
  })[section];

const changeLabel = (change: DiffRow['change']): string =>
  ({
    added: translate('Added'),
    removed: translate('Removed'),
    changed: translate('Changed'),
    moved: translate('Moved'),
  })[change];

const changeVariant = (change: DiffRow['change']) =>
  (
    ({
      added: 'success',
      removed: 'danger',
      changed: 'primary',
      moved: 'neutral',
    }) as const
  )[change];

const fieldLabel = (field: string): string => stepFieldLabel(field);

// A value longer than this is cut, with the whole of it in the tooltip: a
// rewritten description must not push the table off the screen.
const MAX_VALUE_LENGTH = 160;

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return translate('not set');
  }
  if (typeof value === 'boolean') {
    return value ? translate('yes') : translate('no');
  }
  if (Array.isArray(value)) {
    return value.length ? value.map(formatValue).join(', ') : translate('none');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key.replace(/_/g, ' ')}: ${formatValue(item)}`)
      .join('; ');
  }
  return String(value);
};

const shorten = (text: string): string =>
  text.length > MAX_VALUE_LENGTH
    ? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…`
    : text;

const FieldChange: FC<{ change: WorkflowFieldChange }> = ({ change }) => {
  const parts: ReactNode[] = [];
  if (change.added.length) {
    parts.push(
      translate('added {values}', {
        values: change.added.map(formatValue).join(', '),
      }),
    );
  }
  if (change.removed.length) {
    parts.push(
      translate('removed {values}', {
        values: change.removed.map(formatValue).join(', '),
      }),
    );
  }
  if (!parts.length) {
    parts.push(`${formatValue(change.old)} → ${formatValue(change.new)}`);
  }
  const text = parts.join('; ');
  return (
    <li
      className={classNames(
        'whitespace-normal wrap-anywhere',
        change.kind === 'cosmetic' && 'text-quaternary',
      )}
      title={text.length > MAX_VALUE_LENGTH ? text : undefined}
    >
      <span className="font-semibold">{fieldLabel(change.field)}</span>:{' '}
      {shorten(text)}
    </li>
  );
};

/** The rows of a diff: behaviour changes first, cosmetic ones after. */
export const diffRows = (changes: WorkflowChanges): DiffRow[] => {
  const rows: DiffRow[] = [];
  const entities = (section: Section, list: WorkflowEntityChange[]) =>
    list.forEach((entity) =>
      rows.push({
        id: `${section}:${entity.key}`,
        section,
        name: entity.name,
        oldName: entity.old_name,
        change: entity.change,
        kind: entity.kind,
        stepKey: section === 'steps' ? entity.key : undefined,
        fields: entity.fields,
      }),
    );
  entities('steps', changes.steps);
  changes.call.forEach((field) =>
    rows.push({
      id: `call:${field.field}`,
      section: 'call',
      name: fieldLabel(field.field),
      change: 'changed',
      kind: field.kind,
      fields: [field],
    }),
  );
  entities('proposal_roles', changes.proposal_roles);
  entities('panels', changes.panels);
  entities('forms', changes.forms);
  return [
    ...rows.filter((row) => row.kind === 'behaviour'),
    ...rows.filter((row) => row.kind === 'cosmetic'),
  ];
};

/**
 * The changes between two versions of a call's workflow, by step and
 * field. Cosmetic changes -- names, descriptions -- are muted. With the
 * descriptions of both sides, a changed step shows its summary before and
 * after.
 */
export const WorkflowDiffView: FC<{
  changes: WorkflowChanges;
  before?: WorkflowDescription;
  after?: WorkflowDescription;
  emptyText?: string;
}> = ({ changes, before, after, emptyText }) => {
  const rows = useMemo(() => diffRows(changes), [changes]);
  const tableProps = useRowsTable('WorkflowDiff', rows, rows);
  const behaviour = changes.summary.behaviour ?? 0;
  const sentence = (description: WorkflowDescription | undefined, key) => {
    const step = description?.steps.find((s) => s.key === key);
    return step && description ? (
      <StepSummary step={fromDescription(step, description)} />
    ) : null;
  };
  const columns: Column<DiffRow>[] = [
    {
      title: translate('What'),
      ellipsis: false,
      render: ({ row }) => (
        // A cosmetic change reads quieter by weight, not by fading: faded
        // text falls under 4.5:1, and the "Cosmetic" badge says it in words.
        <div>
          <div className="text-quaternary">{sectionLabel(row.section)}</div>
          <div
            className={
              row.kind === 'cosmetic' ? 'font-normal' : 'font-semibold'
            }
          >
            {row.name}
          </div>
          {row.oldName && (
            <div className="text-quaternary">
              {translate('was {name}', { name: row.oldName })}
            </div>
          )}
        </div>
      ),
    },
    {
      title: translate('Change'),
      render: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={changeVariant(row.change)}
            size="sm"
            shape="pill"
            tone="outline"
          >
            {changeLabel(row.change)}
          </Badge>
          {row.kind === 'cosmetic' && (
            <Badge variant="neutral" size="sm" shape="pill" tone="outline">
              {translate('Cosmetic')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: translate('Details'),
      ellipsis: false,
      render: ({ row }) => (
        <div>
          {row.fields.length > 0 && (
            <ul className="mb-0 ps-3">
              {row.fields.map((field, index) => (
                <FieldChange key={index} change={field} />
              ))}
            </ul>
          )}
          {row.stepKey && row.kind === 'behaviour' && (before || after) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mt-2">
              <div>
                <div className="text-quaternary uppercase">
                  {translate('Before')}
                </div>
                {sentence(before, row.stepKey) ?? renderFieldOrDash(null)}
              </div>
              <div>
                <div className="text-quaternary uppercase">
                  {translate('After')}
                </div>
                {sentence(after, row.stepKey) ?? renderFieldOrDash(null)}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];
  return (
    <div data-testid="workflow-diff">
      {behaviour ? (
        <p className="mb-2.5">
          {behaviour === 1
            ? translate('1 behavioral change, {cosmetic} cosmetic.', {
                cosmetic: changes.summary.cosmetic ?? 0,
              })
            : translate('{count} behavioral changes, {cosmetic} cosmetic.', {
                count: behaviour,
                cosmetic: changes.summary.cosmetic ?? 0,
              })}
        </p>
      ) : (
        <EmptyState
          size="sm"
          className="mb-2.5"
          message={emptyText ?? translate('No behavioral changes.')}
        />
      )}
      {rows.length > 0 && (
        <Table<DiffRow>
          {...tableProps}
          showPageSizeSelector
          columns={columns}
          verboseName={translate('Changes')}
          hideTitle
          hasActionBar={false}
          minHeight="auto"
          placeholderHasRetry={false}
        />
      )}
    </div>
  );
};
