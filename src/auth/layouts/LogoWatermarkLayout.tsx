import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { getIconUrl } from '@/core/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

import { AuthHeader } from '../AuthHeader';
import { AuthHeaderControls } from '../AuthHeaderControls';
import { LoginLogo } from '../LoginLogo';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './LogoWatermarkLayout.css';

export const LogoWatermarkLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-logo-watermark">
      <div
        className="layout-logo-watermark-bg"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="layout-logo-watermark-header">
        <LanguageSelectorBox />
        <AuthHeaderControls />
      </div>
      <div className="layout-logo-watermark-content">
        <div className="layout-logo-watermark-card">
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
      <div className="layout-logo-watermark-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
