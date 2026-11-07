import {
  ClipboardTextIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  GavelIcon,
  RobotIcon,
  UserIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { FC, KeyboardEvent, MouseEvent, Ref, useMemo } from 'react';
import { WorkflowDescription, WorkflowDescriptionStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { StepFormPage } from '@/proposals/update/workflow-steps/stepForm';
import { outcomeLabel } from '@/proposals/workflow/constants';

import { OpenStep } from '../RoleMatrix';
import { actorTitle, conditionText } from '../summary';

import {
  columnLabels,
  describeDiagram,
  stepBoxLabel,
  terminalLabel,
} from './diagramText';
import {
  DiagramBox,
  DiagramEdge,
  DiagramLayout,
  DiagramTerminal,
  COLUMN_WIDTH,
  HEADER_HEIGHT,
  isRoundScoped,
  LANE_LABEL_WIDTH,
  layoutDiagram,
  stepContributors,
  terminalId,
  TerminalKind,
} from './layout';
import { progressFill, StepProgressOverlay } from './overlay';
import { DiagramPalette, useDiagramPalette } from './palette';

// The colours live in the drawing itself, so an exported SVG or PNG looks
// as it does on the page, in the theme it was drawn in.
const diagramStyle = (p: DiagramPalette) => `
.wd-bg { fill: ${p.background}; }
.wd-lane { fill: ${p.background}; }
.wd-lane-alt { fill: ${p.backgroundAlt}; }
.wd-lane-line { stroke: ${p.line}; }
.wd-section-line { stroke: ${p.lineStrong}; stroke-width: 1.5; stroke-dasharray: 6 4; }
.wd-lane-label { fill: ${p.label}; font: 600 12px sans-serif; }
.wd-header { fill: ${p.muted}; font: 600 11px sans-serif; text-transform: uppercase; }
.wd-box { fill: ${p.boxFill}; stroke: ${p.boxStroke}; stroke-width: 1.2; }
.wd-box-disabled { fill: ${p.disabledFill}; stroke: ${p.boxStroke}; stroke-dasharray: 4 3; }
.wd-box-focus:focus .wd-box, .wd-box-focus:hover .wd-box { stroke: ${p.accent}; stroke-width: 2; }
.wd-name { fill: ${p.text}; font: 600 12px sans-serif; }
.wd-text { fill: ${p.body}; font: 11px sans-serif; }
.wd-negative { fill: ${p.negative}; }
.wd-overdue { fill: ${p.negative}; font-weight: 600; }
.wd-icon { color: ${p.body}; }
.wd-badge { fill: ${p.accentSoft}; stroke: ${p.accent}; }
.wd-badge-text { fill: ${p.accentText}; font: 600 10px sans-serif; }
.wd-edge { fill: none; stroke: ${p.muted}; stroke-width: 1.3; }
.wd-edge-input { stroke: ${p.accent}; stroke-dasharray: 6 4; }
.wd-edge-condition { stroke: ${p.condition}; }
.wd-edge-bypass { stroke: ${p.condition}; stroke-dasharray: 2 4; }
.wd-edge-negative { stroke: ${p.negative}; }
.wd-edge-change_request { stroke: ${p.warning}; stroke-dasharray: 6 3; }
.wd-stub { font: 600 9px sans-serif; fill: ${p.negative}; }
.wd-stub-change_request { fill: ${p.warning}; }
.wd-diamond { fill: ${p.conditionSoft}; stroke: ${p.condition}; }
.wd-edge-label { fill: ${p.conditionText}; font: 10px sans-serif; }
.wd-terminal-rejected, .wd-terminal-canceled { fill: ${p.negativeSoft}; stroke: ${p.negative}; }
.wd-terminal-returned { fill: ${p.warningSoft}; stroke: ${p.warning}; }
.wd-terminal-text { fill: ${p.text}; font: 600 12px sans-serif; }
`;

const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

const StepKindGlyph: FC<{
  step: WorkflowDescriptionStep;
  x: number;
  y: number;
}> = ({ step, x, y }) => {
  if (step.decides_automatically) {
    return (
      <RobotIcon className="wd-icon" x={x} y={y} size={16} weight="bold" />
    );
  }
  switch (step.kind) {
    case 'applicant_action':
      return (
        <UserIcon className="wd-icon" x={x} y={y} size={16} weight="bold" />
      );
    case 'assignment':
      return (
        <UsersThreeIcon
          className="wd-icon"
          x={x}
          y={y}
          size={16}
          weight="bold"
        />
      );
    case 'decision':
      return (
        <GavelIcon className="wd-icon" x={x} y={y} size={16} weight="bold" />
      );
    default:
      return (
        <ClipboardTextIcon
          className="wd-icon"
          x={x}
          y={y}
          size={16}
          weight="bold"
        />
      );
  }
};

const anchor = (
  rect: { x: number; y: number; width: number; height: number },
  side: 'left' | 'right',
) => ({
  x: side === 'left' ? rect.x : rect.x + rect.width,
  y: rect.y + rect.height / 2,
});

const edgePath = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  arc = 0,
) => {
  const dx = Math.max(40, (to.x - from.x) / 2);
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y - arc}, ${
    to.x - dx
  } ${to.y - arc}, ${to.x} ${to.y}`;
};

const Edge: FC<{
  edge: DiagramEdge;
  boxes: Map<string, DiagramBox | DiagramTerminal>;
}> = ({ edge, boxes }) => {
  const source = boxes.get(edge.from);
  const target = boxes.get(edge.to);
  if (!source || !target) return null;
  const from = anchor(source, 'right');
  const to = anchor(target, 'left');
  const arc = edge.kind === 'bypass' ? source.height : 0;
  const red = edge.kind === 'negative';
  const orange = edge.kind === 'change_request';
  const marker = red
    ? 'url(#wd-arrow-red)'
    : orange
      ? 'url(#wd-arrow-orange)'
      : 'url(#wd-arrow)';
  const description = {
    sequence: translate('Next'),
    condition: translate('Only if {condition}', {
      condition: edge.label ?? '',
    }),
    bypass: translate('Skipped when its condition does not hold'),
    input: translate('Reads the outputs of'),
    negative: translate('Negative outcome'),
    change_request: translate('Changes requested of the applicant'),
  }[edge.kind];
  // An end far to the right would cross the whole drawing: a short arrow
  // out of the box, named after the end it leads to, says the same.
  if ((red || orange) && target.x - (source.x + source.width) > COLUMN_WIDTH) {
    // Below the box, in the gap before the next one: the negative end at
    // the right corner, a request for changes at the left.
    const start = orange
      ? { x: source.x + 12, y: source.y + source.height }
      : { x: source.x + source.width - 12, y: source.y + source.height };
    return (
      <g data-testid={`diagram-edge-${edge.kind}`}>
        <title>{description}</title>
        <path
          className={`wd-edge wd-edge-${edge.kind}`}
          d={`M ${start.x} ${start.y} L ${start.x} ${start.y + 9}`}
          markerEnd={marker}
        />
        <text
          className={`wd-stub wd-stub-${edge.kind}`}
          x={orange ? start.x + 6 : start.x - 6}
          y={start.y + 12}
          textAnchor={orange ? 'start' : 'end'}
        >
          {terminalLabel(edge.to.replace('terminal:', '') as TerminalKind)}
        </text>
      </g>
    );
  }
  // The condition's diamond sits just before the step it guards.
  const diamond = { x: to.x - 18, y: to.y };
  return (
    <g data-testid={`diagram-edge-${edge.kind}`}>
      <title>{description}</title>
      <path
        className={`wd-edge wd-edge-${edge.kind}`}
        d={edgePath(from, edge.kind === 'condition' ? diamond : to, arc)}
        markerEnd={edge.kind === 'condition' ? undefined : marker}
      />
      {edge.kind === 'condition' && (
        <>
          <path
            className="wd-diamond"
            d={`M ${diamond.x - 7} ${diamond.y} L ${diamond.x} ${
              diamond.y - 7
            } L ${diamond.x + 7} ${diamond.y} L ${diamond.x} ${diamond.y + 7} Z`}
          />
          <path
            className="wd-edge wd-edge-condition"
            d={`M ${diamond.x + 7} ${diamond.y} L ${to.x} ${to.y}`}
            markerEnd="url(#wd-arrow-condition)"
          />
          <text
            className="wd-edge-label"
            x={diamond.x - 10}
            y={diamond.y - 10}
            textAnchor="end"
          >
            {truncate(edge.label ?? '', 26)}
          </text>
        </>
      )}
      {edge.kind === 'bypass' && (
        <text
          className="wd-edge-label"
          x={(from.x + to.x) / 2}
          y={Math.min(from.y, to.y) - arc * 0.75}
          textAnchor="middle"
        >
          {translate('skipped')}
        </text>
      )}
    </g>
  );
};

const Box: FC<{
  box: DiagramBox;
  actorLabels: Map<string, string>;
  rounds: number;
  progress?: StepProgressOverlay;
  palette: DiagramPalette;
  /** The box's accessible name: step, stage, lane and outcomes. */
  label: string;
  onOpenStep?: OpenStep;
}> = ({ box, actorLabels, rounds, progress, palette, label, onOpenStep }) => {
  const { step, x, y, width, height } = box;
  const open = (page: StepFormPage) => (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    onOpenStep?.(step.key, page);
  };
  const keyOpen = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open('basics')(event);
    }
  };
  const part = (page: StepFormPage) =>
    onOpenStep
      ? { onClick: open(page), style: { cursor: 'pointer' } as const }
      : {};
  const contributors = stepContributors(step)
    .map((actor) => actorLabels.get(actor) ?? actor)
    .join(', ');
  const roundScoped = isRoundScoped(step);
  const statusLabels = (step.extra as any)?.status_labels as
    Record<string, string> | undefined;
  return (
    <g
      className={onOpenStep ? 'wd-box-focus' : undefined}
      data-testid={`diagram-box-${step.key}`}
      role={onOpenStep ? 'button' : undefined}
      tabIndex={onOpenStep ? 0 : undefined}
      aria-label={onOpenStep ? label : undefined}
      onClick={onOpenStep ? open('basics') : undefined}
      onKeyDown={onOpenStep ? keyOpen : undefined}
      style={onOpenStep ? { cursor: 'pointer' } : undefined}
    >
      <title>
        {[
          step.name,
          step.enabled ? null : translate('Disabled'),
          contributors
            ? translate('Contributors: {roles}', { roles: contributors })
            : null,
          translate('The applicant sees: {label}', {
            label: step.applicant.label,
          }),
          ...Object.entries(statusLabels ?? {}).map(
            ([audience, label]) => `${audience}: ${label}`,
          ),
        ]
          .filter(Boolean)
          .join('\n')}
      </title>
      <rect
        className={step.enabled ? 'wd-box' : 'wd-box-disabled'}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        style={progress ? { fill: progressFill(progress, palette) } : undefined}
      />
      <StepKindGlyph step={step} x={x + 8} y={y + 8} />
      <text className="wd-name" x={x + 30} y={y + 21}>
        {truncate(step.name, 21)}
      </text>
      <g {...part('inputs')}>
        <title>
          {step.applicant.visible
            ? translate('Visible to the applicant')
            : translate('Hidden from the applicant')}
        </title>
        {step.applicant.visible ? (
          <EyeIcon
            className="wd-icon"
            x={x + width - 24}
            y={y + 8}
            size={16}
            weight="bold"
          />
        ) : (
          <EyeSlashIcon
            className="wd-icon"
            x={x + width - 24}
            y={y + 8}
            size={16}
            weight="bold"
          />
        )}
      </g>
      <g {...part('evaluation')}>
        <text className="wd-text" x={x + 10} y={y + 41}>
          {step.outcomes.map((outcome, index) => {
            const label = outcomeLabel(outcome.value);
            return (
              <tspan
                key={outcome.value}
                x={index === 0 ? x + 10 : undefined}
                className={
                  outcome.polarity === 'negative' ? 'wd-negative' : undefined
                }
              >
                {index ? ` · ${label}` : label}
              </tspan>
            );
          })}
        </text>
      </g>
      {progress ? (
        <>
          <text className="wd-text" x={x + 10} y={y + 61}>
            {progress.round_scoped && progress.rounds?.length
              ? translate('Opened in {opened} of {count} rounds', {
                  opened: progress.rounds.filter((round) => round.opened)
                    .length,
                  count: progress.rounds.length,
                })
              : progress.median_days != null
                ? translate('Median {median} d of {planned}', {
                    median: progress.median_days,
                    planned:
                      progress.planned_days != null
                        ? `${progress.planned_days} d`
                        : '—',
                  })
                : translate('None completed yet')}
          </text>
          <text className="wd-text" x={x + 10} y={y + 79}>
            {translate('{count} waiting', { count: progress.waiting })}
            {progress.overdue ? (
              <tspan className="wd-overdue">
                {' · '}
                {translate('{count} overdue', { count: progress.overdue })}
              </tspan>
            ) : null}
          </text>
        </>
      ) : (
        <>
          <g {...part('timing')}>
            <ClockIcon
              className="wd-icon"
              x={x + 9}
              y={y + 50}
              size={13}
              weight="bold"
            />
            <text className="wd-text" x={x + 26} y={y + 61}>
              {step.duration_in_days
                ? translate('{days} d', { days: step.duration_in_days })
                : translate('No duration')}
            </text>
          </g>
          {contributors ? (
            <g {...part('participants')}>
              <text className="wd-text" x={x + 10} y={y + 79}>
                {truncate(`+ ${contributors}`, 30)}
              </text>
            </g>
          ) : (
            <text className="wd-text" x={x + 10} y={y + 79}>
              {truncate(step.applicant.label, 30)}
            </text>
          )}
        </>
      )}
      {roundScoped ? (
        <g data-testid="diagram-round-badge">
          <title>
            {translate('Runs once per round, for all its proposals together')}
          </title>
          <rect
            className="wd-badge"
            x={x + width - 58}
            y={y + 48}
            width={50}
            height={18}
            rx={9}
          />
          <text
            className="wd-badge-text"
            x={x + width - 33}
            y={y + 61}
            textAnchor="middle"
          >
            {rounds > 1 ? `×${rounds}` : translate('round')}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Where the diagram puts everything, with its lanes and conditions named. */
export const useDiagramLayout = (
  description: WorkflowDescription,
  showDisabled?: boolean,
): DiagramLayout => {
  const actorLabels = useActorLabels(description);
  const stepNames = useMemo(
    () => new Map(description.steps.map((step) => [step.key, step.name])),
    [description],
  );
  return useMemo(
    () =>
      layoutDiagram(description, {
        showDisabled,
        actorLabel: (key) => actorLabels.get(key) ?? key,
        conditionLabel: (step: WorkflowDescriptionStep) =>
          step.run_condition
            ? conditionText({
                stepName:
                  stepNames.get(step.run_condition.step) ??
                  step.run_condition.step,
                outcomes: step.run_condition.outcomes,
                scoreSpreadAbove: step.run_condition.score_spread_above,
              })
            : '',
      }),
    [description, showDisabled, actorLabels, stepNames],
  );
};

const useActorLabels = (description: WorkflowDescription) =>
  useMemo(
    () =>
      new Map(
        description.actors.map((actor) => [actor.key, actorTitle(actor)]),
      ),
    [description],
  );

export const SwimlaneDiagram: FC<{
  description: WorkflowDescription;
  showDisabled?: boolean;
  onOpenStep?: OpenStep;
  progress?: Map<string, StepProgressOverlay>;
  svgRef?: Ref<SVGSVGElement>;
  /** The id of the diagram's text version (`DiagramTextList`). */
  describedBy?: string;
}> = ({
  description,
  showDisabled,
  onOpenStep,
  progress,
  svgRef,
  describedBy,
}) => {
  const palette = useDiagramPalette();
  const style = useMemo(() => diagramStyle(palette), [palette]);
  const actorLabels = useActorLabels(description);
  const layout = useDiagramLayout(description, showDisabled);
  const texts = useMemo(
    () => new Map(describeDiagram(layout).map((text) => [text.key, text])),
    [layout],
  );
  const headers = useMemo(() => columnLabels(layout), [layout]);
  const rects = useMemo(() => {
    const result = new Map<string, DiagramBox | DiagramTerminal>();
    layout.boxes.forEach((box) => result.set(box.step.key, box));
    layout.terminals.forEach((terminal) =>
      result.set(terminalId(terminal.kind), terminal),
    );
    return result;
  }, [layout]);
  const rounds = description.call.rounds.length;
  const stagesShown = layout.columns.length;
  if (!layout.boxes.length) {
    return (
      <p className="text-quaternary mb-0">
        {translate('The workflow has no steps to draw.')}
      </p>
    );
  }
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      // A drawing with step boxes to open is a group of buttons; a picture
      // only is an image. Either way the steps and where they lead are also
      // given as a list (`describedBy`).
      role={onOpenStep ? 'group' : 'img'}
      aria-label={translate('Workflow diagram')}
      aria-describedby={describedBy}
      data-testid="workflow-diagram"
    >
      <style>{style}</style>
      <defs>
        {[
          ['wd-arrow', palette.muted],
          ['wd-arrow-red', palette.negative],
          ['wd-arrow-orange', palette.warning],
          ['wd-arrow-condition', palette.condition],
        ].map(([id, color]) => (
          <marker
            key={id}
            id={id}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <rect className="wd-bg" width={layout.width} height={layout.height} />
      {layout.lanes.map((lane, index) => (
        <g key={lane.key} data-testid={`diagram-lane-${lane.key}`}>
          <rect
            className={index % 2 ? 'wd-lane-alt' : 'wd-lane'}
            x={0}
            y={lane.y}
            width={layout.width}
            height={lane.height}
          />
          <line
            className="wd-lane-line"
            x1={0}
            x2={layout.width}
            y1={lane.y}
            y2={lane.y}
          />
          <text className="wd-lane-label" x={12} y={lane.y + 24}>
            {truncate(lane.label, 22)}
            <title>{lane.label}</title>
          </text>
        </g>
      ))}
      <line
        className="wd-lane-line"
        x1={LANE_LABEL_WIDTH - 8}
        x2={LANE_LABEL_WIDTH - 8}
        y1={0}
        y2={layout.height}
      />
      {layout.sections.map((section) => (
        <g key={section.phase} data-testid={`diagram-section-${section.phase}`}>
          <title>
            {translate(
              'After the award: runs on an accepted proposal, each time it opens',
            )}
          </title>
          <line
            className="wd-section-line"
            x1={section.x}
            x2={section.x}
            y1={0}
            y2={layout.height}
          />
        </g>
      ))}
      {layout.columns.map((column, index) => (
        <text
          key={column.stage}
          className="wd-header"
          x={column.x + 20}
          y={HEADER_HEIGHT - 12}
        >
          {headers[index]}
        </text>
      ))}
      {layout.terminals.length ? (
        <text
          className="wd-header"
          x={LANE_LABEL_WIDTH + stagesShown * COLUMN_WIDTH + 20}
          y={HEADER_HEIGHT - 12}
        >
          {translate('Ends')}
        </text>
      ) : null}
      {layout.edges.map((edge, index) => (
        <Edge key={index} edge={edge} boxes={rects} />
      ))}
      {layout.boxes.map((box) => (
        <Box
          key={box.step.key}
          box={box}
          actorLabels={actorLabels}
          rounds={rounds}
          progress={progress?.get(box.step.key)}
          palette={palette}
          label={stepBoxLabel(texts.get(box.step.key)!)}
          onOpenStep={onOpenStep}
        />
      ))}
      {layout.terminals.map((terminal) => (
        <g
          key={terminal.kind}
          data-testid={`diagram-terminal-${terminal.kind}`}
        >
          <rect
            className={`wd-terminal-${terminal.kind}`}
            x={terminal.x}
            y={terminal.y}
            width={terminal.width}
            height={terminal.height}
            rx={terminal.height / 2}
          />
          <text
            className="wd-terminal-text"
            x={terminal.x + terminal.width / 2}
            y={terminal.y + terminal.height / 2 + 4}
            textAnchor="middle"
          >
            {terminalLabel(terminal.kind)}
          </text>
        </g>
      ))}
    </svg>
  );
};
