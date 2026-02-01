import { FlaskIcon, LightbulbIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
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
            <CompactSubmitButton
              submitting={false}
              type="button"
              variant="primary"
              disabled
              iconNode={<FlaskIcon weight="bold" />}
              iconOnLeft
              label={translate('What if')}
            />
          </Tip>
        ) : (
          <Link
            state={analyticsState}
            params={{ mode: 'what-if' }}
            className="btn btn-primary btn-sm"
          >
            <FlaskIcon weight="bold" className="me-1" />
            {translate('What if')}
          </Link>
        ))}
      {hasWhySo &&
        (isDisabled ? (
          <Tip
            id="proposal-why-so-tip"
            label={translate('No data available for analysis')}
          >
            <CompactSubmitButton
              submitting={false}
              type="button"
              variant="primary"
              disabled
              iconNode={<LightbulbIcon weight="bold" />}
              iconOnLeft
              label={translate('Why so')}
            />
          </Tip>
        ) : (
          <Link
            state={analyticsState}
            params={{ mode: 'why-so' }}
            className="btn btn-primary btn-sm"
          >
            <LightbulbIcon weight="bold" className="me-1" />
            {translate('Why so')}
          </Link>
        ))}
    </div>
  );
};
