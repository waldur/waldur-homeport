import { FC } from 'react';

import { SummaryStep, formatStepSummary } from './summary';

/** A step's behaviour in one sentence, under its name. */
export const StepSummary: FC<{ step: SummaryStep; className?: string }> = ({
  step,
  className = 'text-quaternary text-xs mb-0',
}) => (
  <p className={className} data-testid="step-summary">
    {formatStepSummary(step)}
  </p>
);
