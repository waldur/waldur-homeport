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
import { getHeroBackgroundImage } from '../heroImage';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './CarouselLayout.css';

const DEFAULT_SLIDES = [
  {
    title: 'Manage Cloud Resources',
    subtitle: 'Access and control your infrastructure in one place',
  },
  {
    title: 'Team Collaboration',
    subtitle: 'Work together with your colleagues seamlessly',
  },
  {
    title: 'Enterprise Ready',
    subtitle: 'Secure, scalable, and compliant with regulations',
  },
];

export const CarouselLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const slides = ENV.plugins.WALDUR_CORE.LOGIN_PAGE_CAROUSEL_SLIDES?.length
    ? ENV.plugins.WALDUR_CORE.LOGIN_PAGE_CAROUSEL_SLIDES
    : DEFAULT_SLIDES;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  const slide = slides[activeSlide];

  return (
    <div className="layout-carousel">
      <div className="layout-carousel-login">
        <div className="layout-carousel-header">
          <LanguageSelectorBox />
          <ThemeSwitcherButton />
        </div>
        <div className="layout-carousel-form">
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
        <div className="layout-carousel-footer">
          <FooterLinks />
        </div>
      </div>
      <div
        className="layout-carousel-hero"
        style={{ backgroundImage: getHeroBackgroundImage() }}
      >
        <div className="layout-carousel-hero-overlay">
          <div className="layout-carousel-slide" key={activeSlide}>
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
          </div>
          <div className="layout-carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`layout-carousel-indicator ${index === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
