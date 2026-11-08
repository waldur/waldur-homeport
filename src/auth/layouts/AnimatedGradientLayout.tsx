import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getBrandColor } from '@/core/utils';
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

import './AnimatedGradientLayout.css';

export const AnimatedGradientLayout = () => {
  const features = useAuthFeatures();
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
        <AuthHeaderControls />
      </div>
      <div className="layout-animated-gradient-content">
        <div className="layout-animated-gradient-card">
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
      <div className="layout-animated-gradient-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
