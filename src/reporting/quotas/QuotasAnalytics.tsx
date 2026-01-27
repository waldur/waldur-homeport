import { FlaskIcon, LightbulbIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { AnalyticsMode } from '../analytics';

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

  const hasWhatIf = supportedModes.includes('what-if');
  const hasWhySo = supportedModes.includes('why-so');
  const isDisabled = loading || data.length === 0;

  return (
    <div className="d-flex gap-2">
      {hasWhatIf && (
        <Link
          state="reporting-quotas-analytics"
          params={{ mode: 'what-if' }}
          className={`btn btn-outline-primary btn-sm${isDisabled ? ' disabled' : ''}`}
        >
          <FlaskIcon weight="bold" className="me-1" />
          {translate('What if')}
        </Link>
      )}
      {hasWhySo && (
        <Link
          state="reporting-quotas-analytics"
          params={{ mode: 'why-so' }}
          className={`btn btn-outline-primary btn-sm${isDisabled ? ' disabled' : ''}`}
        >
          <LightbulbIcon weight="bold" className="me-1" />
          {translate('Why so')}
        </Link>
      )}
    </div>
  );
};
