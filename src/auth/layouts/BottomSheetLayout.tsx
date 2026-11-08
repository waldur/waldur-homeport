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

import './BottomSheetLayout.css';

export const BottomSheetLayout = () => {
  const features = useAuthFeatures();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-bottom-sheet">
      <div
        className="layout-bottom-sheet-hero"
        style={{ backgroundImage: getHeroBackgroundImage() }}
      >
        <div className="layout-bottom-sheet-hero-overlay">
          <div className="layout-bottom-sheet-header">
            <LanguageSelectorBox />
            <AuthHeaderControls />
          </div>
          <div className="layout-bottom-sheet-hero-content">
            <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
            <HeroButton />
          </div>
        </div>
      </div>
      <div className="layout-bottom-sheet-panel">
        <div className="layout-bottom-sheet-handle" />
        <div className="layout-bottom-sheet-content">
          <LoginLogo className="mb-2.5" size="sm" />
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
        <div className="layout-bottom-sheet-footer">
          <FooterLinks />
        </div>
      </div>
    </div>
  );
};
