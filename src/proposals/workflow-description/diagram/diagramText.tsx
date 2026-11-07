import { FC } from 'react';

import { translate } from '@/i18n';
import { outcomeLabel } from '@/proposals/workflow/constants';

import { DiagramBox, DiagramLayout, TerminalKind } from './layout';

/** The phases after the award, as the diagram heads their columns. */
const PHASE_LABELS = (): Record<string, string> => ({
  extension: translate('Extension'),
  closing: translate('Closing'),
});

export const terminalLabel = (kind: TerminalKind) =>
  ({
    rejected: translate('Rejected'),
    canceled: translate('Canceled'),
    returned: translate('Returned to applicant'),
  })[kind];

/** The heading of each column: "Stage 2", "Extension · Stage 1 · together". */
export const columnLabels = (layout: DiagramLayout): string[] =>
  layout.columns.map((column) => {
    const number =
      layout.columns
        .filter((other) => other.phase === column.phase)
        .indexOf(column) + 1;
    const phase = PHASE_LABELS()[column.phase];
    const stage =
      column.steps > 1
        ? translate('Stage {number} · together', { number })
        : translate('Stage {number}', { number });
    return phase ? `${phase} · ${stage}` : stage;
  });

const nodeName = (key: string, stepNames: Map<string, string>) =>
  key.startsWith('terminal:')
    ? terminalLabel(key.replace('terminal:', '') as TerminalKind)
    : (stepNames.get(key) ?? key);

export interface DiagramStepText {
  key: string;
  name: string;
  stage: string;
  lane: string;
  disabled: boolean;
  outcomes: string;
  /** Where the step leads, one sentence per edge out of it. */
  transitions: string[];
}

/**
 * The diagram in words, step by step in the order the engine runs them: the stage, the
 * lane, the outcomes and every edge out of the step. It is what a screen
 * reader gets instead of the picture.
 */
export const describeDiagram = (layout: DiagramLayout): DiagramStepText[] => {
  const stages = columnLabels(layout);
  const lanes = new Map(layout.lanes.map((lane) => [lane.key, lane.label]));
  const stepNames = new Map(
    layout.boxes.map((box) => [box.step.key, box.step.name]),
  );
  const ordered = [...layout.boxes].sort(
    (a, b) => a.column - b.column || a.step.order - b.step.order,
  );
  return ordered.map((box: DiagramBox) => {
    const transitions = layout.edges
      .filter((edge) => edge.from === box.step.key)
      .map((edge) => {
        const to = nodeName(edge.to, stepNames);
        switch (edge.kind) {
          case 'sequence':
            return translate('Then: {step}.', { step: to });
          case 'condition':
            return translate('Then: {step}, only if {condition}.', {
              step: to,
              condition: edge.label ?? '',
            });
          case 'bypass':
            return translate(
              'When the next stage is skipped, its condition not holding: {step}.',
              { step: to },
            );
          case 'input':
            return translate('Its outputs are read by: {step}.', { step: to });
          case 'negative':
            return translate('A negative outcome ends it: {end}.', {
              end: to,
            });
          case 'change_request':
            return translate('Changes may be requested of the applicant.');
          default:
            return '';
        }
      })
      .filter(Boolean);
    return {
      key: box.step.key,
      name: box.step.name,
      stage: stages[box.column] ?? '',
      lane: lanes.get(box.lane) ?? box.lane,
      disabled: !box.step.enabled,
      outcomes: box.step.outcomes
        .map((outcome) => outcomeLabel(outcome.value))
        .join(', '),
      transitions,
    };
  });
};

/** The accessible name of a step's box: what, when, who and how it ends. */
export const stepBoxLabel = (text: DiagramStepText) =>
  [
    text.name,
    text.stage,
    text.lane,
    text.outcomes
      ? translate('outcomes: {outcomes}', { outcomes: text.outcomes })
      : null,
    text.disabled ? translate('disabled') : null,
  ]
    .filter(Boolean)
    .join(', ');

/** The steps and where they lead, as an ordered list. */
export const DiagramTextList: FC<{
  steps: DiagramStepText[];
  id?: string;
  className?: string;
}> = ({ steps, id, className }) => (
  <ol
    id={id}
    className={className}
    aria-label={translate('Workflow steps and transitions')}
    data-testid="workflow-diagram-text"
  >
    {steps.map((step) => (
      <li key={step.key} className="mb-1.5">
        <span className="font-semibold">{step.name}</span>
        {' — '}
        {[step.stage, step.lane].join(', ')}
        {step.disabled ? ` (${translate('disabled')})` : null}
        {step.outcomes ? (
          <>
            {'. '}
            {translate('Outcomes: {outcomes}.', { outcomes: step.outcomes })}
          </>
        ) : (
          '.'
        )}
        {step.transitions.map((transition) => (
          <span key={transition}> {transition}</span>
        ))}
      </li>
    ))}
  </ol>
);
