import { FC } from 'react';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

const EXPORT_STATE_VARIANT: Record<string, string> = {
  pending: 'warning',
  exporting: 'primary',
  completed: 'success',
  failed: 'danger',
};

const stateLabel = (state: string) => {
  switch (state) {
    case 'pending':
      return translate('Pending');
    case 'exporting':
      return translate('Exporting');
    case 'completed':
      return translate('Completed');
    case 'failed':
      return translate('Failed');
    default:
      return state;
  }
};

interface MatrixExportStateBadgeProps {
  state: string;
  errorMessage?: string;
}

export const MatrixExportStateBadge: FC<MatrixExportStateBadgeProps> = ({
  state,
  errorMessage,
}) => (
  <StateIndicator
    label={stateLabel(state)}
    variant={EXPORT_STATE_VARIANT[state] || 'default'}
    tooltip={state === 'failed' ? errorMessage : undefined}
    active={state === 'exporting'}
    pill
    outline
  />
);
