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
import { getHeroBackgroundImage } from '../heroImage';
import { LoginLogo } from '../LoginLogo';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './DiagonalLayout.css';

export const DiagonalLayout = () => {
  const features = useAuthFeatures();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-diagonal">
      <div
        className="layout-diagonal-bg"
        style={{ backgroundImage: getHeroBackgroundImage() }}
      />
      <div className="layout-diagonal-overlay" />
      <div className="layout-diagonal-content">
        <div className="layout-diagonal-header">
          <LanguageSelectorBox />
          <AuthHeaderControls />
        </div>
        <div className="layout-diagonal-main">
          <div className="layout-diagonal-hero">
            <h1>{ENV.plugins.WALDUR_CORE.SITE_NAME}</h1>
            <p>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</p>
          </div>
          <div className="layout-diagonal-card">
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
        </div>
        <div className="layout-diagonal-footer">
          <FooterLinks />
        </div>
      </div>
    </div>
  );
};
