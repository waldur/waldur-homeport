import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

import { AuthHeader } from '../AuthHeader';
import { AuthHeaderControls } from '../AuthHeaderControls';
import { HeroButton } from '../HeroButton';
import { getHeroBackgroundImage } from '../heroImage';
import { LoginLogo } from '../LoginLogo';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './FullHeroLayout.css';

export const FullHeroLayout = () => {
  const features = useAuthFeatures();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div
      className="layout-full-hero"
      style={{ backgroundImage: getHeroBackgroundImage() }}
    >
      <div className="layout-full-hero-overlay">
        <div className="layout-full-hero-header">
          <LanguageSelectorBox />
          <AuthHeaderControls />
        </div>
        <div className="layout-full-hero-content">
          <div className="layout-full-hero-login">
            <div className="layout-full-hero-login-inner">
              <LoginLogo className="mb-1.5" size="sm" />
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
          <div className="layout-full-hero-text">
            <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
            <HeroButton />
          </div>
        </div>
        <div className="layout-full-hero-footer">
          <FooterLinks />
        </div>
      </div>
    </div>
  );
};
