import {
  SunIcon,
  CloudIcon,
  CloudRainIcon,
  SnowflakeIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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

import './WeatherLayout.css';

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

const WEATHER_THEMES: Record<
  WeatherType,
  { gradient: string; icon: any; animation: string }
> = {
  sunny: {
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    icon: SunIcon,
    animation: 'sunny',
  },
  cloudy: {
    gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    icon: CloudIcon,
    animation: 'cloudy',
  },
  rainy: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: CloudRainIcon,
    animation: 'rainy',
  },
  snowy: {
    gradient: 'linear-gradient(135deg, #e0e5ec 0%, #a8c0d1 100%)',
    icon: SnowflakeIcon,
    animation: 'snowy',
  },
};

// Simulate weather detection (in real app, would use geolocation + weather API)
function detectWeather(): WeatherType {
  const month = new Date().getMonth();
  const hour = new Date().getHours();

  // Winter months -> snowy
  if (month === 11 || month === 0 || month === 1) return 'snowy';
  // Summer + daytime -> sunny
  if (month >= 5 && month <= 8 && hour >= 8 && hour <= 18) return 'sunny';
  // Autumn -> rainy
  if (month >= 9 && month <= 10) return 'rainy';
  // Default -> cloudy
  return 'cloudy';
}

export const WeatherLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const [weather, setWeather] = useState<WeatherType>('sunny');

  useEffect(() => {
    setWeather(detectWeather());
  }, []);

  const theme = WEATHER_THEMES[weather];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div
      className={`layout-weather layout-weather-${theme.animation}`}
      style={{ background: theme.gradient }}
    >
      <div className="layout-weather-effects">
        {weather === 'rainy' &&
          [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        {weather === 'snowy' &&
          [...Array(30)].map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
      </div>
      <div className="layout-weather-header">
        <LanguageSelectorBox />
        <div className="layout-weather-indicator">
          <theme.icon size={24} />
        </div>
        <ThemeSwitcherButton />
      </div>
      <div className="layout-weather-content">
        <div className="layout-weather-card">
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
      <div className="layout-weather-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
