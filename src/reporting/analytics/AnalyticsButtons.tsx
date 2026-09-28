import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { Link } from '@/core/Link';
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

  size = 'sm',
}) =>
  isDisabled ? (
    <BaseButton
      size={size}
      variant="secondary"
      disabled
      tooltip={translate('No data available for analysis')}
      label={translate('What if')}
    />
  ) : (
    <Link
      state={state}
      params={{ mode: 'what-if' }}
      buttonVariant="secondary"
      buttonSize={size}
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

  size = 'sm',
}) =>
  isDisabled ? (
    <BaseButton
      size={size}
      variant="secondary"
      disabled
      tooltip={translate('No data available for analysis')}
      label={translate('Why so')}
    />
  ) : (
    <Link
      state={state}
      params={{ mode: 'why-so' }}
      buttonVariant="secondary"
      buttonSize={size}
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
