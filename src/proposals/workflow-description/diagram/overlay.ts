import { WorkflowProgress, WorkflowProgressStep } from 'waldur-js-client';

import { DiagramPalette } from './palette';

export type StepProgressOverlay = Pick<
  WorkflowProgressStep,
  'median_days' | 'planned_days' | 'waiting' | 'overdue'
> &
  Partial<Pick<WorkflowProgressStep, 'round_scoped' | 'rounds'>>;

/** How long completed instances took against the plan: the median over the
 * planned duration, or nothing when either is unknown. */
const progressRatio = (progress: StepProgressOverlay): number | null =>
  progress.median_days != null && progress.planned_days
    ? progress.median_days / progress.planned_days
    : null;

/** The box's fill on the palette's sequential scale of its ratio: one hue,
 * standing out more the further past its plan a step runs. */
export const progressFill = (
  progress: StepProgressOverlay,
  palette: DiagramPalette,
): string => {
  const scale = palette.progress;
  const ratio = progressRatio(progress);
  if (ratio == null) return scale[0];
  if (ratio <= 0.5) return scale[1];
  if (ratio <= 1) return scale[2];
  if (ratio <= 1.5) return scale[3];
  return scale[4];
};

export const progressLegend = ({ progress }: DiagramPalette) => [
  { color: progress[1], label: '≤ 50%' },
  { color: progress[2], label: '≤ 100%' },
  { color: progress[3], label: '≤ 150%' },
  { color: progress[4], label: '> 150%' },
];

export const progressByStep = (progress: WorkflowProgress | undefined) =>
  progress
    ? new Map(progress.steps.map((step) => [step.key, step]))
    : undefined;
