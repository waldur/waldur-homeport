import { FC, KeyboardEvent, Ref, useMemo } from 'react';
import {
  OrderFlowDescription,
  OrderFlowStep,
  OrderFlowStepStat,
} from 'waldur-js-client';

import { DiagramPalette, useDiagramPalette } from '@/core/diagram/palette';
import { translate } from '@/i18n';

import {
  FlowBox,
  FlowEdge,
  FlowLayout,
  FlowTerminal,
  HEADER_HEIGHT,
  LANE_LABEL_WIDTH,
  layoutOrderFlow,
  terminalId,
} from './layout';
import {
  formatDuration,
  stepShortLabel,
  stepStatusLabel,
  stepVerdictLine,
  terminalLabel,
} from './text';

// The colours live in the drawing itself, so an exported SVG or PNG looks
// as it does on the page, in the theme it was drawn in.
const flowStyle = (p: DiagramPalette) => `
.wd-of-bg { fill: ${p.background}; }
.wd-of-lane { fill: ${p.background}; }
.wd-of-lane-alt { fill: ${p.backgroundAlt}; }
.wd-of-lane-line { stroke: ${p.line}; }
.wd-of-lane-label { fill: ${p.label}; font: 600 12px sans-serif; }
.wd-of-box { fill: ${p.boxFill}; stroke: ${p.boxStroke}; stroke-width: 1.2; }
.wd-of-box-conditional { fill: ${p.conditionSoft}; stroke: ${p.condition}; }
.wd-of-box-skipped { fill: ${p.disabledFill}; stroke: ${p.boxStroke}; stroke-dasharray: 4 3; }
.wd-of-box-focus:focus .wd-of-box, .wd-of-box-focus:hover .wd-of-box { stroke: ${p.accent}; stroke-width: 2; }
.wd-of-box-selected .wd-of-box { stroke: ${p.accentStrong}; stroke-width: 2.4; }
.wd-of-name { fill: ${p.text}; font: 600 12px sans-serif; }
.wd-of-text { fill: ${p.body}; font: 11px sans-serif; }
.wd-of-condition-text { fill: ${p.conditionText}; font: 11px sans-serif; }
.wd-of-stat { fill: ${p.accentText}; font: 600 10px sans-serif; }
.wd-of-edge { fill: none; stroke: ${p.muted}; stroke-width: 1.3; }
.wd-of-edge-bypass { stroke: ${p.condition}; stroke-dasharray: 2 4; }
.wd-of-edge-negative { stroke: ${p.negative}; stroke-dasharray: 5 3; }
.wd-of-diamond { fill: ${p.conditionSoft}; stroke: ${p.condition}; }
.wd-of-terminal { fill: ${p.negativeSoft}; stroke: ${p.negative}; }
.wd-of-terminal-text { fill: ${p.negativeText}; font: 600 11px sans-serif; }
`;

const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

const right = (box: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => ({
  x: box.x + box.width,
  y: box.y + box.height / 2,
});
const left = (box: { x: number; y: number; height: number }) => ({
  x: box.x,
  y: box.y + box.height / 2,
});

const Edge: FC<{
  edge: FlowEdge;
  rects: Map<string, FlowBox | FlowTerminal>;
}> = ({ edge, rects }) => {
  const source = rects.get(edge.source);
  const target = rects.get(edge.target);
  if (!source || !target) return null;
  if (edge.kind === 'negative') {
    // Straight down from the step, along the end's own line above the row
    // of ends, and down into it: edges to one end share a line instead of
    // crossing the drawing.
    const end = target as FlowTerminal;
    const x = source.x + source.width - 12 - end.index * 8;
    const to = end.x + end.width / 2;
    return (
      <path
        className="wd-of-edge wd-of-edge-negative"
        d={`M ${x} ${source.y + source.height} V ${end.busY} H ${to} V ${end.y}`}
        markerEnd="url(#wd-of-arrow-red)"
      />
    );
  }
  const from = right(source);
  const to = left(target);
  const dx = Math.max(24, (to.x - from.x) / 2);
  return (
    <path
      className={`wd-of-edge${edge.kind === 'bypass' ? ' wd-of-edge-bypass' : ''}`}
      d={`M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`}
      markerEnd={
        edge.kind === 'bypass'
          ? 'url(#wd-of-arrow-condition)'
          : 'url(#wd-of-arrow)'
      }
    />
  );
};

const StepBox: FC<{
  box: FlowBox;
  selected: boolean;
  stat?: OrderFlowStepStat;
  onSelect?: (step: OrderFlowStep) => void;
}> = ({ box, selected, stat, onSelect }) => {
  const { step, x, y, width, height } = box;
  const verdict = stepVerdictLine(step);
  const select = () => onSelect?.(step);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select();
    }
  };
  return (
    <g
      className={`wd-of-box-focus${selected ? ' wd-of-box-selected' : ''}`}
      data-testid={`order-flow-step-${step.key}`}
      data-status={step.status}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      aria-label={`${step.label}: ${stepStatusLabel(step.status)}`}
      onClick={select}
      onKeyDown={onSelect ? onKeyDown : undefined}
      cursor={onSelect ? 'pointer' : undefined}
    >
      <title>
        {[step.label, step.summary, verdict].filter(Boolean).join('\n')}
      </title>
      <rect
        className={`wd-of-box${step.status !== 'runs' ? ` wd-of-box-${step.status}` : ''}`}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
      />
      {step.status === 'conditional' && (
        <path
          className="wd-of-diamond"
          d={`M ${x + 14} ${y + 10} L ${x + 20} ${y + 16} L ${x + 14} ${
            y + 22
          } L ${x + 8} ${y + 16} Z`}
        />
      )}
      <text
        className="wd-of-name"
        x={x + (step.status === 'conditional' ? 26 : 10)}
        y={y + 20}
      >
        {truncate(
          stepShortLabel(step),
          step.status === 'conditional' ? 17 : 19,
        )}
      </text>
      <text
        className={
          step.status === 'conditional' ? 'wd-of-condition-text' : 'wd-of-text'
        }
        x={x + 10}
        y={y + 39}
      >
        {stepStatusLabel(step.status)}
      </text>
      {verdict && (
        <text className="wd-of-text" x={x + 10} y={y + 56}>
          {truncate(verdict, 24)}
        </text>
      )}
      {stat?.median_seconds != null && (
        <text
          className="wd-of-stat"
          x={x + width - 8}
          y={y + 39}
          textAnchor="end"
        >
          {translate('median {duration}', {
            duration: formatDuration(stat.median_seconds),
          })}
        </text>
      )}
    </g>
  );
};

/**
 * How an order for the offering moves: a lane per actor, a box per step
 * in the order an order meets them, the ends it can leave by along the
 * bottom. A step that may or may not run carries a diamond; a skipped one
 * is dashed and bypassed. Selecting a step opens what decides it.
 */
export const OrderFlowDiagram: FC<{
  description: OrderFlowDescription;
  showSkipped?: boolean;
  selectedStep?: string;
  onSelectStep?: (step: OrderFlowStep) => void;
  svgRef?: Ref<SVGSVGElement>;
  describedBy?: string;
}> = ({
  description,
  showSkipped = true,
  selectedStep,
  onSelectStep,
  svgRef,
  describedBy,
}) => {
  const palette = useDiagramPalette();
  const style = useMemo(() => flowStyle(palette), [palette]);
  const layout: FlowLayout = useMemo(
    () => layoutOrderFlow(description, showSkipped),
    [description, showSkipped],
  );
  const rects = useMemo(() => {
    const result = new Map<string, FlowBox | FlowTerminal>();
    layout.boxes.forEach((box) => result.set(box.step.key, box));
    layout.terminals.forEach((terminal) =>
      result.set(terminalId(terminal.terminal.key), terminal),
    );
    return result;
  }, [layout]);
  const stats = useMemo(
    () =>
      new Map(
        (description.stats?.steps ?? []).map((stat) => [stat.step, stat]),
      ),
    [description.stats],
  );
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      role={onSelectStep ? 'group' : 'img'}
      aria-label={translate('Order flow diagram')}
      aria-describedby={describedBy}
      data-testid="order-flow-diagram"
    >
      <style>{style}</style>
      <defs>
        {[
          ['wd-of-arrow', palette.muted],
          ['wd-of-arrow-red', palette.negative],
          ['wd-of-arrow-condition', palette.condition],
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
      <rect className="wd-of-bg" width={layout.width} height={layout.height} />
      {layout.lanes.map((lane, index) => (
        <g key={lane.key} data-testid={`order-flow-lane-${lane.key}`}>
          <rect
            className={index % 2 ? 'wd-of-lane-alt' : 'wd-of-lane'}
            x={0}
            y={lane.y}
            width={layout.width}
            height={lane.height}
          />
          <line
            className="wd-of-lane-line"
            x1={0}
            x2={layout.width}
            y1={lane.y}
            y2={lane.y}
          />
          <text className="wd-of-lane-label" x={12} y={lane.y + 24}>
            {truncate(lane.label, 20)}
          </text>
        </g>
      ))}
      <line
        className="wd-of-lane-line"
        x1={0}
        x2={layout.width}
        y1={layout.terminalRowY}
        y2={layout.terminalRowY}
      />
      <line
        className="wd-of-lane-line"
        x1={LANE_LABEL_WIDTH - 8}
        x2={LANE_LABEL_WIDTH - 8}
        y1={HEADER_HEIGHT}
        y2={layout.height}
      />
      {layout.edges.map((edge) => (
        <Edge
          key={`${edge.kind}-${edge.source}-${edge.target}`}
          edge={edge}
          rects={rects}
        />
      ))}
      {layout.boxes.map((box) => (
        <StepBox
          key={box.step.key}
          box={box}
          selected={box.step.key === selectedStep}
          stat={stats.get(box.step.key)}
          onSelect={onSelectStep}
        />
      ))}
      {layout.terminals.map((terminal) => (
        <g
          key={terminal.terminal.key}
          data-testid={`order-flow-terminal-${terminal.terminal.key}`}
        >
          <rect
            className="wd-of-terminal"
            x={terminal.x}
            y={terminal.y}
            width={terminal.width}
            height={terminal.height}
            rx={16}
          />
          <text
            className="wd-of-terminal-text"
            x={terminal.x + terminal.width / 2}
            y={terminal.y + terminal.height / 2 + 4}
            textAnchor="middle"
          >
            {terminalLabel(terminal.terminal)}
          </text>
        </g>
      ))}
    </svg>
  );
};
