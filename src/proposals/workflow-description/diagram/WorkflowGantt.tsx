import { FC, Ref, useId, useMemo } from 'react';

import { formatDate, parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { DiagramPalette, useDiagramPalette } from './palette';
import { dayTicks, RoundPlan } from './schedule';

const LABEL_WIDTH = 220;
const CHART_WIDTH = 640;
const ROW_HEIGHT = 26;
const TOP = 40;

// The colours live in the drawing itself, so an exported SVG or PNG looks
// as it does on the page, in the theme it was drawn in.
const ganttStyle = (p: DiagramPalette) => `
.wg-bg { fill: ${p.background}; }
.wg-label { fill: ${p.text}; font: 12px sans-serif; }
.wg-muted { fill: ${p.muted}; font: 11px sans-serif; }
.wg-grid { stroke: ${p.line}; }
.wg-bar { fill: ${p.accentMid}; stroke: ${p.accent}; }
.wg-bar-critical { fill: ${p.accent}; stroke: ${p.accentStrong}; stroke-width: 1.5; }
.wg-bar-late { fill: ${p.negativeMid}; stroke: ${p.negative}; }
.wg-bar-late.wg-bar-critical { fill: ${p.negativeStrong}; stroke: ${p.negativeText}; }
.wg-point { fill: ${p.muted}; }
.wg-marker { stroke: ${p.lineStrong}; stroke-dasharray: 4 3; }
.wg-decision { stroke: ${p.negative}; stroke-width: 1.5; }
.wg-decision-text { fill: ${p.negativeText}; font: 600 11px sans-serif; }
`;

// Roughly the width of a character of the bold 11px labels, to tell
// whether a label still fits before the drawing's right edge.
const LABEL_CHAR_WIDTH = 6.6;

const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

/** The planned bars of one round against its cut-off and decision date. */
export const WorkflowGantt: FC<{
  plan: RoundPlan;
  svgRef?: Ref<SVGSVGElement>;
}> = ({ plan, svgRef }) => {
  const palette = useDiagramPalette();
  const style = useMemo(() => ganttStyle(palette), [palette]);
  const listId = useId();
  const span = Math.max(plan.totalDays, plan.decisionDay ?? 0, 7) + 3;
  const scale = CHART_WIDTH / span;
  const dayX = (day: number) => LABEL_WIDTH + day * scale;
  const height = TOP + plan.rows.length * ROW_HEIGHT + 16;
  const width = LABEL_WIDTH + CHART_WIDTH + 20;
  const tickLabel = (day: number) =>
    plan.cutoff
      ? formatDate(parseDate(plan.cutoff).plus({ days: day }))
      : translate('Day {day}', { day });
  const decisionLabel =
    plan.decisionDay != null
      ? translate('Decision due, day {day}', { day: plan.decisionDay })
      : '';
  // Right of its line while it fits; otherwise ending at the line, so a
  // decision due near the end of the chart is not cut off. It sits above
  // the tick labels, on the line of the start marker's label.
  const decisionLabelFits =
    plan.decisionDay != null &&
    dayX(plan.decisionDay) + 3 + decisionLabel.length * LABEL_CHAR_WIDTH <=
      width - 4;
  return (
    // The canvas colour fills the rest of a wider container, so the drawing
    // keeps its text size and no strip of another colour shows beside it.
    <div style={{ background: palette.background }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, display: 'block' }}
        role="img"
        aria-label={translate('Planned timeline')}
        aria-describedby={listId}
        data-testid="workflow-gantt"
      >
        <style>{style}</style>
        <defs>
          <pattern
            id="wg-hatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill={palette.background} />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={palette.accent}
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect className="wg-bg" width={width} height={height} />
        {dayTicks(span).map((day) => (
          <g key={day}>
            <line
              className="wg-grid"
              x1={dayX(day)}
              x2={dayX(day)}
              y1={TOP - 8}
              y2={height - 8}
            />
            <text className="wg-muted" x={dayX(day) + 2} y={TOP - 12}>
              {tickLabel(day)}
            </text>
          </g>
        ))}
        <line
          className="wg-marker"
          x1={dayX(0)}
          x2={dayX(0)}
          y1={12}
          y2={height - 8}
        />
        <text className="wg-muted" x={dayX(0) + 2} y={12}>
          {plan.phase
            ? translate('Run opens')
            : plan.openEnded
              ? translate('Submission')
              : plan.cutoff
                ? translate('Cut-off')
                : translate('Evaluation starts')}
        </text>
        {plan.decisionDay != null && (
          <g data-testid="gantt-decision">
            <line
              className="wg-decision"
              x1={dayX(plan.decisionDay)}
              x2={dayX(plan.decisionDay)}
              y1={12}
              y2={height - 8}
            />
            <text
              className="wg-decision-text"
              x={
                decisionLabelFits
                  ? dayX(plan.decisionDay) + 3
                  : dayX(plan.decisionDay) - 3
              }
              y={12}
              textAnchor={decisionLabelFits ? 'start' : 'end'}
              data-testid="gantt-decision-label"
            >
              {decisionLabel}
            </text>
          </g>
        )}
        {plan.rows.map((row, index) => {
          const y = TOP + index * ROW_HEIGHT;
          const className = [
            'wg-bar',
            row.critical ? 'wg-bar-critical' : '',
            row.late ? 'wg-bar-late' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <g
              key={row.key}
              data-testid={`gantt-row-${row.key}`}
              data-late={row.late ? 'true' : 'false'}
              data-critical={row.critical ? 'true' : 'false'}
            >
              <title>
                {[
                  row.name,
                  translate('Day {start} to {end}', {
                    start: row.start,
                    end: row.end,
                  }),
                  row.conditional ? translate('If its condition holds') : null,
                  row.critical ? translate('On the critical path') : null,
                  row.roundScoped ? translate('Once per round') : null,
                  row.late ? translate('Ends after the decision is due') : null,
                ]
                  .filter(Boolean)
                  .join('\n')}
              </title>
              <text className="wg-label" x={8} y={y + 16}>
                {truncate(row.name, 30)}
              </text>
              {row.noDuration ? (
                <path
                  className="wg-point"
                  d={`M ${dayX(row.start)} ${y + 6} l 6 6 l -6 6 l -6 -6 z`}
                />
              ) : (
                <rect
                  className={className}
                  x={dayX(row.start)}
                  y={y + 5}
                  width={Math.max(2, (row.end - row.start) * scale)}
                  height={ROW_HEIGHT - 10}
                  rx={3}
                  style={
                    row.conditional && !row.late
                      ? { fill: 'url(#wg-hatch)' }
                      : undefined
                  }
                />
              )}
              {row.roundScoped ? (
                <text className="wg-muted" x={dayX(row.end) + 6} y={y + 16}>
                  {translate('once per round')}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <GanttText
        id={listId}
        plan={plan}
        dayLabel={plan.cutoff ? tickLabel : undefined}
      />
    </div>
  );
};

/**
 * The bars in words, for a screen reader: each step's first and last day
 * (and dates, when the round has a cut-off), its length and its flags.
 */
const GanttText: FC<{
  id: string;
  plan: RoundPlan;
  dayLabel?: (day: number) => string;
}> = ({ id, plan, dayLabel }) => (
  <ul id={id} className="sr-only" data-testid="workflow-gantt-text">
    {plan.rows.map((row) => (
      <li key={row.key}>
        {[
          row.noDuration
            ? translate('{step}: on day {day}, no duration', {
                step: row.name,
                day: row.start,
              })
            : translate('{step}: day {start} to day {end}, {days} days', {
                step: row.name,
                start: row.start,
                end: row.end,
                days: row.end - row.start,
              }),
          dayLabel && !row.noDuration
            ? translate('{start} to {end}', {
                start: dayLabel(row.start),
                end: dayLabel(row.end),
              })
            : null,
          row.conditional ? translate('if its condition holds') : null,
          row.critical ? translate('on the critical path') : null,
          row.roundScoped ? translate('once per round') : null,
          row.late ? translate('ends after the decision is due') : null,
        ]
          .filter(Boolean)
          .join('; ')}
      </li>
    ))}
    {plan.decisionDay != null ? (
      <li>
        {translate('Decision due, day {day}', { day: plan.decisionDay })}
        {dayLabel ? ` (${dayLabel(plan.decisionDay)})` : null}
      </li>
    ) : null}
  </ul>
);
