import { CookieIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { ENV } from '@waldur/core/config';
import { Link } from '@waldur/core/Link';
import { SubmitButton } from '@waldur/form';
import { formatJsx, translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import './CookiesConsent.css';

interface OwnProps {
  resolve: { acceptAll; acceptEssential };
}

export const CookiesConsentDialog: FC<OwnProps> = ({ resolve }) => {
  const hasAnalyticalSoftware =
    ENV.plugins.WALDUR_CORE.MATOMO_SITE_ID &&
    ENV.plugins.WALDUR_CORE.MATOMO_URL_BASE;

  return (
    <ModalDialog
      title={
        hasAnalyticalSoftware
          ? translate('Optional cookies: Help us improve your experience')
          : translate('Essential cookies: required for platform functionality')
      }
      subtitle={
        <>
          <p>
            {hasAnalyticalSoftware
              ? translate(
                  'In addition to <b>essential cookies</b>, which are mandatory for the proper functioning of the platform, we also use <b>analytical cookies</b>. These cookies help us understand how users interact with the platform, allowing us to improve performance and user experience.',
                  { b: (s) => <b>{s}</b> },
                  formatJsx,
                )
              : translate(
                  'This site only uses <b>essential cookies</b>, which are necessary for the platform to function correctly. These cookies enable you to log in, access secure areas, and navigate throughout the site. No other types of cookies are used.',
                  { b: (s) => <b>{s}</b> },
                  formatJsx,
                )}
          </p>
          <p className="mb-0">
            {translate(
              'For complete details, please see our <pp>Privacy policy</pp>.',
              {
                pp: (s: string) => <Link state="about.privacy" label={s} />,
              },
              formatJsx,
            )}
          </p>
        </>
      }
      iconNode={<CookieIcon weight="bold" />}
      iconColor="warning"
      className="cookiealert"
      bodyClassName="pt-0 pb-10"
      footer={
        hasAnalyticalSoftware ? (
          <>
            <SubmitButton
              submitting={false}
              onClick={resolve.acceptEssential}
              variant="tertiary"
              className="flex-equal"
              type="button"
              label={translate('Deny analytical cookies')}
            />
            <SubmitButton
              submitting={false}
              onClick={resolve.acceptAll}
              className="flex-equal"
              type="button"
              label={translate('Accept all')}
            />
          </>
        ) : (
          <SubmitButton
            submitting={false}
            onClick={resolve.acceptAll}
            className="w-100"
            type="button"
            label={translate('Accept & continue')}
          />
        )
      }
    />
  );
};
