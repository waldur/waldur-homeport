import { FC } from 'react';

import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';

import { AnalyticsMode } from './types';

interface AnalyticsButtonProps {
  /** The navigation state to go to */
  state: string;
  /** Whether the button should be disabled (e.g. no data) */
  isDisabled?: boolean;
  /** Unique ID for the tooltip */
  tipId?: string;
  /** Button size ('sm' by default) */
  size?: 'sm' | 'md';
}

/**
 * Standardized "What if" button for scenario analysis.
 */
const WhatIfButton: FC<AnalyticsButtonProps> = ({
  state,
  isDisabled,
  tipId,
  size = 'sm',
}) =>
  isDisabled ? (
    <Tip
      id={tipId || 'what-if-tip'}
      label={translate('No data available for analysis')}
    >
      <CompactSubmitButton
        submitting={false}
        type="button"
        variant="secondary"
        disabled
        label={translate('What if')}
      />
    </Tip>
  ) : (
    <Link
      state={state}
      params={{ mode: 'what-if' }}
      className={`btn btn-secondary ${size === 'sm' ? 'btn-sm' : ''}`}
    >
      {translate('What if')}
    </Link>
  );

/**
 * Standardized "Why so" button for root cause analysis.
 */
const WhySoButton: FC<AnalyticsButtonProps> = ({
  state,
  isDisabled,
  tipId,
  size = 'sm',
}) =>
  isDisabled ? (
    <Tip
      id={tipId || 'why-so-tip'}
      label={translate('No data available for analysis')}
    >
      <CompactSubmitButton
        submitting={false}
        type="button"
        variant="secondary"
        disabled
        label={translate('Why so')}
      />
    </Tip>
  ) : (
    <Link
      state={state}
      params={{ mode: 'why-so' }}
      className={`btn btn-secondary ${size === 'sm' ? 'btn-sm' : ''}`}
    >
      {translate('Why so')}
    </Link>
  );

interface AnalyticsButtonsProps {
  /** The navigation state to go to */
  state: string;
  /** Which analytics modes are supported by the report */
  supportedModes: AnalyticsMode[];
  /** Whether buttons should be disabled (e.g. no data or loading) */
  isDisabled?: boolean;
  /** Unique name for the report, used to generate unique tooltip IDs */
  name?: string;
  /** Button size ('sm' by default) */
  size?: 'sm' | 'md';
}

/**
 * A wrapper component that renders both "What if" and "Why so" buttons
 * if they are supported by the current analytics capability.
 */
export const AnalyticsButtons: FC<AnalyticsButtonsProps> = ({
  state,
  supportedModes,
  isDisabled,
  name,
  size = 'sm',
}) => {
  const hasWhatIf = supportedModes.includes('what-if');
  const hasWhySo = supportedModes.includes('why-so');

  return (
    <div className="d-flex gap-2">
      {hasWhatIf && (
        <WhatIfButton
          state={state}
          isDisabled={isDisabled}
          tipId={name ? `${name}-what-if-tip` : undefined}
          size={size}
        />
      )}
      {hasWhySo && (
        <WhySoButton
          state={state}
          isDisabled={isDisabled}
          tipId={name ? `${name}-why-so-tip` : undefined}
          size={size}
        />
      )}
    </div>
  );
};
