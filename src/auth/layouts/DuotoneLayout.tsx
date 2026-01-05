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
import DefaultHeroImage from '../estonian-bog.jpg';
import { HeroButton } from '../HeroButton';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './DuotoneLayout.css';

export const DuotoneLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const customHeroImage = getIconUrl('hero_image');
  const backgroundImage = customHeroImage || DefaultHeroImage;
  const brandColor = ENV.plugins.WALDUR_CORE.BRAND_COLOR || '#307300';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-duotone">
      <div className="layout-duotone-login">
        <div className="layout-duotone-header">
          <ThemeSwitcherButton />
        </div>
        <div className="layout-duotone-form">
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
        <div className="layout-duotone-footer">
          <LanguageSelectorBox />
          <FooterLinks />
        </div>
      </div>
      <div
        className="layout-duotone-hero"
        style={
          {
            '--duotone-color': brandColor,
          } as React.CSSProperties
        }
      >
        <div
          className="layout-duotone-hero-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="layout-duotone-hero-overlay" />
        <div className="layout-duotone-hero-content">
          <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
          <HeroButton />
        </div>
      </div>
    </div>
  );
};
