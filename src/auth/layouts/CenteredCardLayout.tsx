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
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './CenteredCardLayout.css';

export const CenteredCardLayout = () => {
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
      className="layout-centered-card"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="layout-centered-card-overlay">
        <div className="layout-centered-card-header">
          <ThemeSwitcherButton />
        </div>
        <div className="layout-centered-card-content">
          <div className="layout-centered-card-box">
            <div className="login-logo mb-2">
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
        <div className="layout-centered-card-footer">
          <LanguageSelectorBox />
          <FooterLinks />
        </div>
      </div>
    </div>
  );
};
