import { FC, useMemo } from 'react';

import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { AnalyticsButtons, AnalyticsMode } from '../analytics';

interface QuotasAnalyticsProps {
  data: unknown[];
  loading?: boolean;
}

const supportedModes: AnalyticsMode[] = ['what-if', 'why-so'];

/**
 * Buttons component that navigates to the Quotas Analytics page with specific mode.
 * Only visible when experimental UI components are enabled.
 */
export const QuotasAnalytics: FC<QuotasAnalyticsProps> = ({
  data,
  loading,
}) => {
  const showExperimental = useMemo(
    () => isExperimentalUiComponentsVisible(),
    [],
  );

  if (!showExperimental) {
    return null;
  }

  const isDisabled = loading || data.length === 0;

  return (
    <AnalyticsButtons
      state="reporting-quotas-analytics"
      supportedModes={supportedModes}
      isDisabled={isDisabled}
      name="quotas"
    />
  );
};
