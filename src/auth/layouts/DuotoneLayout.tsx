import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getBrandColor } from '@/core/utils';
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

import './DuotoneLayout.css';

export const DuotoneLayout = () => {
  const features = useAuthFeatures();
  const brandColor = getBrandColor();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-duotone">
      <div className="layout-duotone-login">
        <div className="layout-duotone-header">
          <LanguageSelectorBox />
          <AuthHeaderControls />
        </div>
        <div className="layout-duotone-form">
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
        <div className="layout-duotone-footer">
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
          style={{ backgroundImage: getHeroBackgroundImage() }}
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
