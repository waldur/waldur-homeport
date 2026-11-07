import { FC, useId, useMemo, useRef } from 'react';
import {
  WorkflowTimeline,
  WorkflowTimelineNotification,
  WorkflowTimelineStep,
} from 'waldur-js-client';

import { AccordionCard, BaseButton } from 'waldur-ui';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { getProposalStateOptions } from '@/proposals/utils';
import { outcomeLabel } from '@/proposals/workflow/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { recipientLabel, triggerLabel } from '../mail/labels';
import { useProposalWorkflowTimeline } from '../queries';

import { DiagramPalette, useDiagramPalette } from './palette';
import { ScrollRegion } from './ScrollRegion';
import { WorkflowMailDialog } from './WorkflowMailDialog';

import './WorkflowDiagram.scss';

const DAY = 86400000;
const LABEL_WIDTH = 240;
const CHART_WIDTH = 620;
const ROW_HEIGHT = 30;
// Room after the chart for the last date's label.
const RIGHT = 90;
// Roughly how wide a date label is, to leave out one that would not fit.
const TICK_LABEL_WIDTH = 72;
const TOP = 34;

// The colours live in the drawing itself, as in the workflow diagram.
const chartStyle = (p: DiagramPalette) => `
.pg-bg { fill: ${p.background}; }
.pg-label { fill: ${p.text}; font: 12px sans-serif; }
.pg-muted { fill: ${p.muted}; font: 11px sans-serif; }
.pg-grid { stroke: ${p.line}; }
.pg-planned { fill: none; stroke: ${p.boxStroke}; stroke-dasharray: 4 3; }
.pg-actual { fill: ${p.accent}; }
.pg-active { fill: ${p.accentMid}; }
.pg-overdue { fill: ${p.negativeStrong}; }
.pg-mail { fill: ${p.condition}; stroke: ${p.background}; stroke-width: 1.5; }
.pg-now { stroke: ${p.lineStrong}; stroke-dasharray: 2 3; }
.pg-projected { opacity: 0.55; }
`;

const time = (value?: string | null) =>
  value ? new Date(value).getTime() : null;

const statusText = (step: WorkflowTimelineStep) =>
  ({
    pending: translate('not started'),
    active: translate('in progress'),
    completed: step.outcome
      ? outcomeLabel(step.outcome)
      : translate('completed'),
    expired: translate('expired'),
    skipped: translate('not needed'),
    withdrawn: translate('withdrawn'),
  })[step.status] ?? step.status;

const mailTitle = (mail: WorkflowTimelineNotification) =>
  [
    formatDateTime(mail.created),
    mail.template,
    mail.trigger,
    translate('{audience}: {count} recipient(s)', {
      audience: mail.audience,
      count: mail.recipient_count,
    }),
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * When the steps not started yet would start, by their planned durations:
 * stage after stage, a stage starting once every earlier one is expected to
 * end -- a running step at its planned end, or today once past it. Only
 * while a step runs, or before the first starts when ``startsAt`` says when
 * that will be (a submitted proposal waiting for its round's cut-off): a
 * proposal that has stopped has no steps to come.
 */
export const projectedStarts = (
  steps: WorkflowTimelineStep[],
  now: number,
  startsAt?: number,
): Map<string, number> => {
  const projected = new Map<string, number>();
  const waiting =
    startsAt != null && steps.every((step) => step.started_at == null);
  if (!waiting && !steps.some((step) => step.status === 'active')) {
    return projected;
  }
  const origin = waiting ? Math.max(now, startsAt) : now;
  // A step without a stage runs after the one before it.
  const stageOf = new Map(
    steps.map((step, index) => [step.key, step.stage ?? index]),
  );
  const ends = new Map<number, number>();
  const stages = [...new Set(stageOf.values())].sort((a, b) => a - b);
  for (const stage of stages) {
    const earlier = [...ends.entries()]
      .filter(([other]) => other < stage)
      .map(([, end]) => end);
    const from = Math.max(origin, ...earlier);
    for (const step of steps.filter((s) => stageOf.get(s.key) === stage)) {
      const started = time(step.started_at);
      let end: number | null = null;
      if (started != null) {
        const planned = step.planned_days
          ? started + step.planned_days * DAY
          : started;
        end = time(step.completed_at) ?? Math.max(planned, now);
      } else if (step.status === 'pending' && step.planned_days) {
        projected.set(step.key, from);
        end = from + step.planned_days * DAY;
      }
      if (end != null) ends.set(stage, Math.max(ends.get(stage) ?? end, end));
    }
  }
  return projected;
};

/** One proposal's steps: planned (dashed) against actual, with the mail
 * the workflow sent as markers. */
export const ProposalStepsChart: FC<{
  timeline: WorkflowTimeline;
  /** When the first step starts, while none has: the round's cut-off. */
  startsAt?: string;
}> = ({ timeline, startsAt }) => {
  const palette = useDiagramPalette();
  const style = useMemo(() => chartStyle(palette), [palette]);
  const listId = useId();
  const now = time(timeline.generated_at) ?? Date.now();
  const cutoff = time(startsAt);
  const projected = useMemo(
    () => projectedStarts(timeline.steps, now, cutoff ?? undefined),
    [timeline, now, cutoff],
  );
  const { start, end } = useMemo(() => {
    const times: number[] = [];
    for (const step of timeline.steps) {
      const from = projected.get(step.key);
      if (from != null) {
        times.push(from, from + (step.planned_days ?? 0) * DAY);
      }
    }
    for (const step of timeline.steps) {
      const started = time(step.started_at);
      if (started == null) continue;
      times.push(started);
      times.push(time(step.completed_at) ?? now);
      if (step.planned_days) times.push(started + step.planned_days * DAY);
      if (step.deadline) times.push(time(step.deadline)!);
    }
    timeline.notifications.forEach((mail) => times.push(time(mail.created)!));
    if (!times.length) return { start: now - DAY, end: now + DAY };
    // Today stays in the frame, a plan that starts later included.
    const first = Math.min(...times, now);
    const last = Math.max(...times, now);
    // Past the last event and today, so a step still running does not end on
    // the frame and today's line stays in sight.
    return {
      start: first,
      end: last + Math.max(7 * DAY, (last - first) / 10),
    };
  }, [timeline, now, projected]);
  const scale = CHART_WIDTH / Math.max(DAY, end - start);
  const x = (value: number) => LABEL_WIDTH + (value - start) * scale;
  const rows: Array<{ key: string | null; step?: WorkflowTimelineStep }> = [
    ...timeline.steps.map((step) => ({ key: step.key, step })),
  ];
  const proposalMail = timeline.notifications.filter((mail) => !mail.step_key);
  if (proposalMail.length) rows.push({ key: null });
  const rowOf = new Map(rows.map((row, index) => [row.key, index]));
  const height = TOP + rows.length * ROW_HEIGHT + 12;
  const width = LABEL_WIDTH + CHART_WIDTH + RIGHT;
  const spanDays = (end - start) / DAY;
  const tickStep = spanDays <= 21 ? 7 : spanDays <= 90 ? 14 : 30;
  const ticks: number[] = [];
  for (let t = start; t <= end; t += tickStep * DAY) ticks.push(t);
  return (
    // The canvas colour fills the rest of a wider container.
    <div style={{ background: palette.background }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, display: 'block' }}
        role="img"
        aria-label={translate('Steps planned against actual')}
        aria-describedby={listId}
        data-testid="proposal-steps-gantt"
      >
        <style>{style}</style>
        <rect className="pg-bg" width={width} height={height} />
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className="pg-grid"
              x1={x(tick)}
              x2={x(tick)}
              y1={TOP - 6}
              y2={height - 6}
            />
            {/* Not over today's or the cut-off's label, nor past the frame. */}
            {Math.abs(x(tick) - x(now)) > TICK_LABEL_WIDTH / 2 + 24 &&
            (cutoff == null ||
              Math.abs(x(tick) - x(cutoff)) > TICK_LABEL_WIDTH + 24) &&
            x(tick) + TICK_LABEL_WIDTH < width ? (
              <text className="pg-muted" x={x(tick) + 2} y={TOP - 10}>
                {formatDate(tick)}
              </text>
            ) : null}
          </g>
        ))}
        <line
          className="pg-now"
          x1={x(now)}
          x2={x(now)}
          y1={TOP - 6}
          y2={height - 6}
        />
        <text className="pg-muted" x={x(now)} y={TOP - 10} textAnchor="middle">
          {translate('Today')}
        </text>
        {cutoff != null && cutoff > now ? (
          <>
            <line
              className="pg-now"
              x1={x(cutoff)}
              x2={x(cutoff)}
              y1={TOP - 6}
              y2={height - 6}
            />
            <text
              className="pg-muted"
              x={x(cutoff)}
              y={TOP - 10}
              textAnchor="middle"
            >
              {translate('Evaluation starts {date}', {
                date: formatDate(cutoff),
              })}
            </text>
          </>
        ) : null}
        {rows.map((row, index) => {
          const y = TOP + index * ROW_HEIGHT;
          const step = row.step;
          if (!step) {
            return (
              <text key="proposal" className="pg-label" x={8} y={y + 19}>
                {translate('Proposal')}
              </text>
            );
          }
          const started = time(step.started_at);
          const finished = time(step.completed_at);
          const projectedStart = projected.get(step.key);
          return (
            <g
              key={`${step.key}-${index}`}
              data-testid={`proposal-gantt-row-${step.key}`}
            >
              <title>
                {[
                  step.name,
                  statusText(step),
                  step.completed_by_name
                    ? translate('Completed by {name}', {
                        name: step.completed_by_name,
                      })
                    : null,
                  step.planned_days
                    ? translate('Planned: {days} days', {
                        days: step.planned_days,
                      })
                    : null,
                  step.overdue ? translate('Past its deadline') : null,
                  projectedStart != null
                    ? translate(
                        'Projected from {date}, by the planned durations',
                        {
                          date: formatDate(projectedStart),
                        },
                      )
                    : null,
                ]
                  .filter(Boolean)
                  .join('\n')}
              </title>
              <text className="pg-label" x={8} y={y + 14}>
                {step.name.length > 32
                  ? `${step.name.slice(0, 31)}…`
                  : step.name}
              </text>
              <text className="pg-muted" x={8} y={y + 27}>
                {statusText(step)}
                {step.completed_by_name ? ` · ${step.completed_by_name}` : ''}
              </text>
              {started != null && step.planned_days ? (
                <rect
                  className="pg-planned"
                  x={x(started)}
                  y={y + 4}
                  width={step.planned_days * DAY * scale}
                  height={ROW_HEIGHT - 8}
                  rx={3}
                />
              ) : null}
              {projectedStart != null && step.planned_days ? (
                <rect
                  className="pg-planned pg-projected"
                  data-testid={`proposal-gantt-projected-${step.key}`}
                  x={x(projectedStart)}
                  y={y + 4}
                  width={step.planned_days * DAY * scale}
                  height={ROW_HEIGHT - 8}
                  rx={3}
                />
              ) : null}
              {started != null ? (
                <rect
                  className={
                    step.overdue
                      ? 'pg-overdue'
                      : finished == null
                        ? 'pg-active'
                        : 'pg-actual'
                  }
                  data-testid={`proposal-gantt-actual-${step.key}`}
                  data-overdue={step.overdue ? 'true' : 'false'}
                  x={x(started)}
                  y={y + 9}
                  width={Math.max(2, ((finished ?? now) - started) * scale)}
                  height={ROW_HEIGHT - 18}
                  rx={2}
                />
              ) : null}
            </g>
          );
        })}
        {timeline.notifications.map((mail, index) => {
          const row = rowOf.get(mail.step_key ?? null) ?? rows.length - 1;
          const created = time(mail.created)!;
          return (
            <circle
              key={index}
              className="pg-mail"
              data-testid="proposal-gantt-mail"
              cx={x(created)}
              cy={TOP + row * ROW_HEIGHT + ROW_HEIGHT / 2}
              r={5}
            >
              <title>{mailTitle(mail)}</title>
            </circle>
          );
        })}
      </svg>
      <ul
        id={listId}
        className="sr-only"
        data-testid="proposal-steps-gantt-text"
      >
        {timeline.steps.map((step, index) => (
          <li key={`${step.key}-${index}`}>{stepText(step, now)}</li>
        ))}
      </ul>
    </div>
  );
};

/** A step's bar in words: when it started and ended, against the plan. */
const stepText = (step: WorkflowTimelineStep, now: number) => {
  const started = time(step.started_at);
  const finished = time(step.completed_at);
  const days = (from: number, to: number) => Math.round((to - from) / DAY);
  return [
    `${step.name}: ${statusText(step)}`,
    started == null
      ? null
      : finished == null
        ? translate('started {date}, open for {days} days', {
            date: formatDate(started),
            days: days(started, now),
          })
        : translate('from {start} to {end}, {days} days', {
            start: formatDate(started),
            end: formatDate(finished),
            days: days(started, finished),
          }),
    step.planned_days
      ? translate('planned {days} days', { days: step.planned_days })
      : null,
    step.overdue ? translate('past its deadline') : null,
    step.completed_by_name
      ? translate('completed by {name}', { name: step.completed_by_name })
      : null,
  ]
    .filter(Boolean)
    .join('; ');
};

/** "Step started", or the mail's name where it has no trigger. */
/** What a mail was about: the proposal's own mails by their template, a
 * step's mail by its trigger. */
const mailLabel = (row: WorkflowTimelineNotification) => {
  if (row.template === 'new_proposal_submitted') {
    return translate('New proposal submitted');
  }
  if (row.template === 'proposal_state_changed') {
    const state = getProposalStateOptions().find(
      (option) => option.value === row.trigger,
    );
    return translate('Proposal {state}', {
      state: (state?.label ?? row.trigger).toLowerCase(),
    });
  }
  return row.trigger
    ? triggerLabel(row.trigger)
    : row.template.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
};

const MailTable: FC<{ timeline: WorkflowTimeline }> = ({ timeline }) => {
  const rowsRef = useRef(timeline.notifications);
  rowsRef.current = timeline.notifications;
  const filter = useMemo(
    () => ({ generated: timeline.generated_at }),
    [timeline.generated_at],
  );
  const tableProps = useTable<WorkflowTimelineNotification>({
    table: `proposal-workflow-mail-${timeline.proposal_uuid}`,
    filter,
    fetchData: (request) => {
      const rows = rowsRef.current;
      const start = (request.currentPage - 1) * request.pageSize;
      return Promise.resolve({
        rows: rows.slice(start, start + request.pageSize),
        resultCount: rows.length,
      });
    },
  });
  const { openDialog } = useModal();
  const columns: Column<WorkflowTimelineNotification>[] = [
    {
      title: translate('Sent'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
    },
    {
      title: translate('Step'),
      render: ({ row }) => <>{renderFieldOrDash(row.step_name)}</>,
    },
    {
      // What the mail was about: its trigger, else the mail itself.
      title: translate('Mail'),
      render: ({ row }) => <>{mailLabel(row)}</>,
    },
    {
      title: translate('To'),
      render: ({ row }) => (
        <>
          {row.audience
            ? recipientLabel(row.audience)
            : renderFieldOrDash(null)}
        </>
      ),
    },
    {
      title: translate('Recipients'),
      render: ({ row }) =>
        row.email_log_uuids?.length ? (
          <BaseButton
            variant="text-primary"
            size="sm"
            label={translate('{count} · View mail', {
              count: row.recipient_count,
            })}
            onClick={() =>
              openDialog(WorkflowMailDialog, {
                resolve: {
                  proposalUuid: timeline.proposal_uuid,
                  emailLogUuids: row.email_log_uuids,
                  title: translate('{mail}: as sent', { mail: mailLabel(row) }),
                },
                size: 'lg',
              })
            }
          />
        ) : (
          <span
            title={translate('Sent before the text of workflow mail was kept.')}
          >
            {row.recipient_count}
          </span>
        ),
    },
  ];
  return (
    <Table<WorkflowTimelineNotification>
      {...tableProps}
      showPageSizeSelector
      columns={columns}
      verboseName={translate('mails')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

/**
 * The call team's view of how one proposal moved through the workflow.
 * Nothing at all for anyone else: the endpoint answers them 404.
 */
export const ProposalStepsGantt: FC<{
  proposalUuid: string;
  /** When evaluation starts, for a proposal waiting for it: the steps are
   * then planned from that date instead of not at all. */
  startsAt?: string;
}> = ({ proposalUuid, startsAt }) => {
  const { data } = useProposalWorkflowTimeline(proposalUuid);
  if (!data || !data.steps.length) return null;
  const unlogged = data.steps.filter(
    (step) =>
      step.sent_notifications.length &&
      !data.notifications.some((mail) => mail.step_key === step.key),
  );
  return (
    // Folded until opened: the call team's view of the proposal comes
    // first.
    <AccordionCard
      id="proposal-steps-gantt-section"
      className="mt-5"
      title={translate('Planned and actual')}
      subtitle={translate(
        'Dashed: the time each step was planned to take, faint for the steps to come; solid: the time it took, red when past its deadline. Dots mark the workflow mail sent.',
      )}
      defaultOpen={false}
    >
      <ScrollRegion
        className="workflow-diagram-scroll mb-3"
        label={translate('Planned and actual')}
      >
        <ProposalStepsChart timeline={data} startsAt={startsAt} />
      </ScrollRegion>
      {unlogged.length ? (
        <p className="text-quaternary text-xs">
          {translate(
            'Mail sent before sends were logged, without times: {steps}.',
            {
              steps: unlogged
                .map(
                  (step) =>
                    `${step.name} (${step.sent_notifications.join(', ')})`,
                )
                .join('; '),
            },
          )}
        </p>
      ) : null}
      {data.notifications.length ? <MailTable timeline={data} /> : null}
    </AccordionCard>
  );
};
