import { FC } from 'react';
import { ProgressBar } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface StageProgressProps {
  stage: number;
  total: number;
  label: string;
  /** Number of items/pages completed */
  done: number;
  /** Total items/pages expected; 0 = unknown (indeterminate bar) */
  max: number;
  /** Short status message shown on the right (overrides done/max counter) */
  statusMsg?: string;
}

export const StageProgress: FC<StageProgressProps> = ({
  stage,
  total,
  label,
  done,
  max,
  statusMsg,
}) => {
  const pct = max > 0 ? Math.round((done / max) * 100) : 0;
  const indeterminate = max === 0;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small text-muted mb-1">
        <span>
          {translate('Stage {stage} of {total} — {label}', {
            stage,
            total,
            label,
          })}
        </span>
        {statusMsg ? (
          <span>{statusMsg}</span>
        ) : (
          !indeterminate && (
            <span>
              {done} / {max}
            </span>
          )
        )}
      </div>
      <ProgressBar
        striped
        animated
        now={indeterminate ? 100 : pct}
        style={{ height: 8 }}
      />
    </div>
  );
};
