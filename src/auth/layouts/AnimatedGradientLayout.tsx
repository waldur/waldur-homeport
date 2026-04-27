import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getBrandColor } from '@/core/utils';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';
import { ThemeSwitcherButton } from '@/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './AnimatedGradientLayout.css';

export const AnimatedGradientLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const brandColor = getBrandColor();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div
      className="layout-animated-gradient"
      style={
        {
          '--brand-color': brandColor,
        } as React.CSSProperties
      }
    >
      <div className="layout-animated-gradient-bg" />
      <div className="layout-animated-gradient-header">
        <LanguageSelectorBox />
        <ThemeSwitcherButton />
      </div>
      <div className="layout-animated-gradient-content">
        <div className="layout-animated-gradient-card">
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
      <div className="layout-animated-gradient-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
