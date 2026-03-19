import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { SubmitButton } from '@waldur/form';
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
      {hasWhatIf &&
        (isDisabled ? (
          <Tip
            id="proposal-what-if-tip"
            label={translate('No data available for analysis')}
          >
            <SubmitButton
              submitting={false}
              type="button"
              variant="secondary"
              disabled
              label={translate('What if')}
            />
          </Tip>
        ) : (
          <Link
            state={analyticsState}
            params={{ mode: 'what-if' }}
            className="btn btn-secondary"
          >
            {translate('What if')}
          </Link>
        ))}
      {hasWhySo &&
        (isDisabled ? (
          <Tip
            id="proposal-why-so-tip"
            label={translate('No data available for analysis')}
          >
            <SubmitButton
              submitting={false}
              type="button"
              variant="primary"
              disabled
              label={translate('Why so')}
            />
          </Tip>
        ) : (
          <Link
            state={analyticsState}
            params={{ mode: 'why-so' }}
            className="btn btn-primary"
          >
            {translate('Why so')}
          </Link>
        ))}
    </div>
  );
};
