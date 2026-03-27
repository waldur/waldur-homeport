import { FC } from 'react';

import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { AnalyticsButtons, AnalyticsMode } from '../analytics';

interface ProposalAnalyticsButtonsProps {
  /** Route state name for the analytics page */
  analyticsState: string;
  /** Supported analytics modes */
  supportedModes?: AnalyticsMode[];
  /** Whether data is loading */
  loading?: boolean;
  /** Whether there is data to analyze */
  hasData?: boolean;
}

/**
 * Reusable analytics buttons component for proposal reports.
 * Shows separate "What if" and "Why so" buttons that navigate to the analytics page.
 * Only renders when experimental UI is enabled.
 */
export const ProposalAnalyticsButtons: FC<ProposalAnalyticsButtonsProps> = ({
  analyticsState,
  supportedModes = ['what-if', 'why-so'],
  loading = false,
  hasData = true,
}) => {
  if (!isExperimentalUiComponentsVisible()) {
    return null;
  }

  const isDisabled = loading || !hasData;

  return (
    <AnalyticsButtons
      state={analyticsState}
      supportedModes={supportedModes}
      isDisabled={isDisabled}
      name="proposal"
      size="md"
    />
  );
};
