import { FlaskIcon, LightbulbIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { AnalyticsMode } from '../analytics';

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

  const hasWhatIf = supportedModes.includes('what-if');
  const hasWhySo = supportedModes.includes('why-so');
  const isDisabled = loading || !hasData;

  return (
    <div className="d-flex gap-2">
      {hasWhatIf && (
        <Link
          state={analyticsState}
          params={{ mode: 'what-if' }}
          className={`btn btn-outline-primary btn-sm${isDisabled ? ' disabled' : ''}`}
        >
          <FlaskIcon weight="bold" className="me-1" />
          {translate('What if')}
        </Link>
      )}
      {hasWhySo && (
        <Link
          state={analyticsState}
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
