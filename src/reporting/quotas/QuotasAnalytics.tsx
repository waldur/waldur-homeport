import { FlaskIcon, LightbulbIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
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
      {hasWhatIf &&
        (isDisabled ? (
          <Tip
            id="quotas-what-if-tip"
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
            state="reporting-quotas-analytics"
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
            id="quotas-why-so-tip"
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
            state="reporting-quotas-analytics"
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
