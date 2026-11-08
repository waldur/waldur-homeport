import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getBrandColor } from '@/core/utils';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

import { AuthHeader } from '../AuthHeader';
import { AuthHeaderControls } from '../AuthHeaderControls';
import { LoginLogo } from '../LoginLogo';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './BrandPatternLayout.css';

export const BrandPatternLayout = () => {
  const features = useAuthFeatures();
  const brandColor = getBrandColor();

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
        <LanguageSelectorBox />
        <AuthHeaderControls />
      </div>
      <div className="layout-brand-pattern-content">
        <div className="layout-brand-pattern-card">
          <LoginLogo className="mb-2.5" />
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
        <FooterLinks />
      </div>
    </div>
  );
};
