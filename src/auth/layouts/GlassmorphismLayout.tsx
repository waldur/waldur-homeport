import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

import { AuthHeader } from '../AuthHeader';
import { AuthHeaderControls } from '../AuthHeaderControls';
import { getHeroBackgroundImage } from '../heroImage';
import { LoginLogo } from '../LoginLogo';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './GlassmorphismLayout.css';

export const GlassmorphismLayout = () => {
  const features = useAuthFeatures();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div
      className="layout-glassmorphism"
      style={{ backgroundImage: getHeroBackgroundImage() }}
    >
      <div className="layout-glassmorphism-header">
        <LanguageSelectorBox />
        <AuthHeaderControls />
      </div>
      <div className="layout-glassmorphism-content">
        <div className="layout-glassmorphism-card">
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
      <div className="layout-glassmorphism-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
