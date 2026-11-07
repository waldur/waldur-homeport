import { ArrowsSplitIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { parallelRunAt, phaseOpenedAt, WorkflowPhaseKey } from './stages';

import './StepGroupHeader.scss';

export const phaseTitle = (phase: WorkflowPhaseKey) =>
  ({
    evaluation: translate('Evaluation'),
    extension: translate('Extension request'),
    closing: translate('Final report'),
  })[phase];

export const phaseHint = (phase: WorkflowPhaseKey) =>
  ({
    evaluation: translate('Every submitted proposal, up to the decision.'),
    extension: translate(
      'After the award, each time the team requests an extension.',
    ),
    closing: translate('After the award, once, for the final report.'),
  })[phase];

/** Opens a phase's rows: the evaluation, or one of the runs after the award. */
const PhaseHeader: FC<{ phase: WorkflowPhaseKey }> = ({ phase }) => (
  <div className="step-group-header step-group-header--phase">
    <span className="step-group-header__title">{phaseTitle(phase)}</span>
    <span className="step-group-header__hint">{phaseHint(phase)}</span>
  </div>
);

/** Opens the rows of a stage whose steps start together. */
const ParallelStageHeader: FC<{ count: number }> = ({ count }) => (
  <div className="step-group-header step-group-header--stage">
    <ArrowsSplitIcon size={14} weight="bold" aria-hidden />
    <span className="step-group-header__title">
      {translate('Runs in parallel')}
    </span>
    <span className="step-group-header__hint">
      {translate('The next {count} steps start together.', { count })}
    </span>
  </div>
);

/**
 * The group header a step list shows above `rows[index]`: a new phase, a
 * parallel stage, or both. For the `rowGroupHeader` of a steps table.
 */
export const stepGroupHeader = <T extends { phase?: string | null }>(
  rows: T[],
  index: number,
  stageKey: (row: T) => unknown,
  /** Off where the phases are tabs of their own rather than headers. */
  showPhase = true,
): ReactNode => {
  const phase = showPhase ? phaseOpenedAt(rows, index) : null;
  const parallel = parallelRunAt(rows, index, stageKey);
  if (!phase && !parallel) return null;
  return (
    <>
      {phase && <PhaseHeader phase={phase} />}
      {parallel > 0 && <ParallelStageHeader count={parallel} />}
    </>
  );
};

/** The class of a row inside a parallel stage, which draws the stage's rail. */
export const parallelRowClass = <T,>(
  rows: T[],
  row: T,
  stageKey: (row: T) => unknown,
): string => {
  const index = rows.indexOf(row);
  if (index < 0) return '';
  const key = stageKey(row);
  if (key === undefined || key === null) return '';
  const inRun =
    (index > 0 && stageKey(rows[index - 1]) === key) ||
    (index < rows.length - 1 && stageKey(rows[index + 1]) === key);
  return inRun ? 'step-row--parallel' : '';
};

/**
 * The class of a disabled step's row, the same in every steps table. It reads
 * quieter by style (italic), not by fading: an opacity takes the muted text
 * under 4.5:1. The "Disabled" badge beside the name says it in words.
 */
export const DISABLED_STEP_ROW_CLASS = 'step-row--disabled';

/** Beside a disabled step's name, in every steps table. */
export const DisabledStepBadge: FC = () => (
  <Badge variant="neutral" size="sm" shape="pill" tone="outline">
    {translate('Disabled')}
  </Badge>
);

/** Read with a parallel step's name, as the table's header row is not. */
export const ParallelStepNote: FC = () => (
  <span className="sr-only">
    {translate('Runs in parallel with the other steps of its stage.')}
  </span>
);
