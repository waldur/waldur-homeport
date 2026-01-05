import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@waldur/administration/api';
import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { LanguageSelectorBox } from '@waldur/i18n/LanguageSelectorBox';
import { FooterLinks } from '@waldur/navigation/FooterLinks';
import { ThemeSwitcherButton } from '@waldur/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './BrandPatternLayout.css';

export const BrandPatternLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const brandColor = ENV.plugins.WALDUR_CORE.BRAND_COLOR || '#307300';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  // Create SVG pattern with brand color
  const patternSvg = `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="2" fill="${brandColor}" opacity="0.3"/>
      <circle cx="0" cy="0" r="2" fill="${brandColor}" opacity="0.3"/>
      <circle cx="60" cy="0" r="2" fill="${brandColor}" opacity="0.3"/>
      <circle cx="0" cy="60" r="2" fill="${brandColor}" opacity="0.3"/>
      <circle cx="60" cy="60" r="2" fill="${brandColor}" opacity="0.3"/>
    </svg>
  `;
  const encodedPattern = `url("data:image/svg+xml,${encodeURIComponent(patternSvg)}")`;

  return (
    <div
      className="layout-brand-pattern"
      style={{ backgroundImage: encodedPattern }}
    >
      <div className="layout-brand-pattern-header">
        <ThemeSwitcherButton />
      </div>
      <div className="layout-brand-pattern-content">
        <div className="layout-brand-pattern-card">
          <div className="login-logo mb-3">
            <img
              alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
              src={imageUrl}
              style={{ maxWidth: '100%', maxHeight: '80px' }}
            />
          </div>
          <AuthHeader />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred
              message={translate('Unable to load identity providers.')}
              loadData={refetch}
            />
          ) : data ? (
            <LoginMethods features={features} providers={data} />
          ) : null}
          <UserAuthWarning />
          <PoweredBy />
        </div>
      </div>
      <div className="layout-brand-pattern-footer">
        <LanguageSelectorBox />
        <FooterLinks />
      </div>
    </div>
  );
};
