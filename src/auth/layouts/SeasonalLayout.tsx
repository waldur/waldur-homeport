import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getIdentityProviders } from '@waldur/administration/api';
import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { LanguageSelectorBox } from '@waldur/i18n/LanguageSelectorBox';
import { FooterLinks } from '@waldur/navigation/footer/FooterLinks';
import { ThemeSwitcherButton } from '@waldur/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './SeasonalLayout.css';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonTheme {
  gradient: string;
  particleClass: string;
  particleCount: number;
}

const SEASON_THEMES: Record<Season, SeasonTheme> = {
  spring: {
    gradient: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
    particleClass: 'particle-petal',
    particleCount: 15,
  },
  summer: {
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    particleClass: 'particle-sun-ray',
    particleCount: 8,
  },
  autumn: {
    gradient: 'linear-gradient(135deg, #c33764 0%, #e67e22 100%)',
    particleClass: 'particle-leaf',
    particleCount: 20,
  },
  winter: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    particleClass: 'particle-snowflake',
    particleCount: 25,
  },
};

function getSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export const SeasonalLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');

  const season = useMemo(() => getSeason(), []);
  const theme = SEASON_THEMES[season];

  const particles = useMemo(
    () =>
      [...Array(theme.particleCount)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 6}s`,
        size: `${6 + Math.random() * 8}px`,
      })),
    [theme.particleCount],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-seasonal" style={{ background: theme.gradient }}>
      <div className="layout-seasonal-decorations">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`seasonal-particle ${theme.particleClass}`}
            style={{
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>
      <div className="layout-seasonal-header">
        <LanguageSelectorBox />
        <ThemeSwitcherButton />
      </div>
      <div className="layout-seasonal-content">
        <div className="layout-seasonal-card">
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
      <div className="layout-seasonal-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
