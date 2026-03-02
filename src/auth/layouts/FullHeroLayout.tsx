import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@waldur/administration/api';
import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { LanguageSelectorBox } from '@waldur/i18n/LanguageSelectorBox';
import { FooterLinks } from '@waldur/navigation/footer/FooterLinks';
import { ThemeSwitcherButton } from '@waldur/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import DefaultHeroImage from '../estonian-bog.jpg';
import { HeroButton } from '../HeroButton';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './FullHeroLayout.css';

export const FullHeroLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const customHeroImage = getIconUrl('hero_image');
  const backgroundImage = customHeroImage || DefaultHeroImage;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div
      className="layout-full-hero"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="layout-full-hero-overlay">
        <div className="layout-full-hero-header">
          <LanguageSelectorBox />
          <ThemeSwitcherButton />
        </div>
        <div className="layout-full-hero-content">
          <div className="layout-full-hero-login">
            <div className="layout-full-hero-login-inner">
              <div className="login-logo mb-2">
                <img
                  alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
                  src={imageUrl}
                  style={{ maxWidth: '100%', maxHeight: '70px' }}
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
