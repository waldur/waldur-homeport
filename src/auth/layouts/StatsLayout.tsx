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

import './StatsLayout.css';

const DEFAULT_STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '50+', label: 'Organizations' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export const StatsLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const brandColor = getBrandColor();
  const stats = ENV.plugins.WALDUR_CORE.LOGIN_PAGE_STATS?.length
    ? ENV.plugins.WALDUR_CORE.LOGIN_PAGE_STATS
    : DEFAULT_STATS;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-stats">
      <div className="layout-stats-hero" style={{ background: brandColor }}>
        <div className="layout-stats-hero-content">
          <h1>{ENV.plugins.WALDUR_CORE.SITE_NAME}</h1>
          <p>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</p>
          <div className="layout-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="layout-stats-item">
                <div className="layout-stats-value">{stat.value}</div>
                <div className="layout-stats-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="layout-stats-login">
        <div className="layout-stats-header">
          <LanguageSelectorBox />
          <ThemeSwitcherButton />
        </div>
        <div className="layout-stats-form">
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
        <div className="layout-stats-footer">
          <FooterLinks />
        </div>
      </div>
    </div>
  );
};
