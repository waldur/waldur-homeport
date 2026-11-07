import { FC } from 'react';
import { StepScoreGate } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

/** The one outcome a step below its score threshold can still take. */
export const OUTCOME_ALLOWED_BELOW_THRESHOLD = 'declined';

const formatScore = (value: number) => String(Math.round(value * 100) / 100);

/** "Score 2.8 / threshold 3 (Consensus report)" */
const formatScoreGate = (gate: StepScoreGate): string => {
  const text = translate('Score {score} / threshold {threshold}', {
    score:
      gate.score === null || gate.score === undefined
        ? translate('none yet')
        : formatScore(gate.score),
    threshold: formatScore(gate.threshold),
  });
  return gate.source_step_name ? `${text} (${gate.source_step_name})` : text;
};

const belowThresholdReason = () =>
  translate(
    'The proposal scores below the quality threshold: it can only be declined.',
  );

/** The active step's score against its threshold, before anyone decides. */
export const ScoreGateAlert: FC<{
  gate?: StepScoreGate | null;
  className?: string;
}> = ({ gate, className }) =>
  gate ? (
    <AlertItem
      variant={gate.passes ? 'info' : 'warning'}
      type="floating"
      className={className}
      title={formatScoreGate(gate)}
      body={gate.passes ? undefined : belowThresholdReason()}
      data-testid="score-gate"
    />
  ) : null;
