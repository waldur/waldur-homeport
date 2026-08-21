import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';
import { ThemeSwitcherButton } from '@/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import { HeroButton } from '../HeroButton';
import { getHeroBackgroundImage } from '../heroImage';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './StackedLayout.css';

export const StackedLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-stacked">
      <div
        className="layout-stacked-hero"
        style={{ backgroundImage: getHeroBackgroundImage() }}
      >
        <div className="layout-stacked-hero-overlay">
          <div className="layout-stacked-hero-header">
            <LanguageSelectorBox />
            <ThemeSwitcherButton />
          </div>
          <div className="layout-stacked-hero-content">
            <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
            <HeroButton />
          </div>
        </div>
      </div>
      <div className="layout-stacked-login">
        <div className="layout-stacked-login-content">
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
      <div className="layout-stacked-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
