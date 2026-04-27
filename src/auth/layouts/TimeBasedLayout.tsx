import {
  SunIcon,
  CloudSunIcon,
  CloudMoonIcon,
  MoonIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './TimeBasedLayout.css';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const TIME_THEMES: Record<
  TimeOfDay,
  { gradient: string; greeting: string; icon: any }
> = {
  morning: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    greeting: 'Good Morning',
    icon: SunIcon,
  },
  afternoon: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    greeting: 'Good Afternoon',
    icon: CloudSunIcon,
  },
  evening: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    greeting: 'Good Evening',
    icon: CloudMoonIcon,
  },
  night: {
    gradient: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 100%)',
    greeting: 'Good Night',
    icon: MoonIcon,
  },
};

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export const TimeBasedLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');

  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const theme = TIME_THEMES[timeOfDay];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-time-based" style={{ background: theme.gradient }}>
      <div className="layout-time-based-header">
        <LanguageSelectorBox />
        <ThemeSwitcherButton />
      </div>
      <div className="layout-time-based-content">
        <div className="layout-time-based-greeting">
          <theme.icon size={32} />
          <h2>{theme.greeting}</h2>
        </div>
        <div className="layout-time-based-card">
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
      <div className="layout-time-based-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
