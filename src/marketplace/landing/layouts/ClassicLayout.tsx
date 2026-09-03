import { FC } from 'react';

import { getIconUrl } from '@/core/api';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import DefaultDarkImage from '@/dashboard/hero/servers-room-dark.png';
import DefaultLightImage from '@/dashboard/hero/servers-room-light.png';
import { translate } from '@/i18n';
import { getMarketplaceTitle } from '@/marketplace/title';
import { useTheme } from '@/theme/useTheme';

import { CategoriesList } from '../CategoriesList';
import { OfferingsGroup } from '../OfferingsGroup';
import { OfferingsSearchBox } from '../OfferingsSearchBox';

import { MarketplaceLayoutProps } from './types';

export const ClassicLayout: FC<MarketplaceLayoutProps> = ({ onTagClick }) => {
  const { theme } = useTheme();
  const title = getMarketplaceTitle();

  const backendImage = getIconUrl('marketplace_hero_image');
  const defaultImage = theme === 'dark' ? DefaultDarkImage : DefaultLightImage;

  return (
    <div className="marketplace-landing-page">
      <LandingHeroSection
        header={translate('Welcome to')}
        title={title}
        context="marketplace"
        backgroundImage={`url(${backendImage}), url(${defaultImage})`}
      >
        <div className="landing-hero__search">
          <OfferingsSearchBox />
        </div>
      </LandingHeroSection>
      <div className="container-fluid">
        <CategoriesList />
      </div>
      <div className="container-fluid mb-10">
        <OfferingsGroup onTagClick={onTagClick} />
      </div>
    </div>
  );
};
