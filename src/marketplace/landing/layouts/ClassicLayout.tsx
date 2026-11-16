import classNames from 'classnames';
import { FC } from 'react';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import DefaultDarkImage from '@/dashboard/hero/servers-room-dark.png';
import DefaultLightImage from '@/dashboard/hero/servers-room-light.png';
import { translate } from '@/i18n';
import { getMarketplaceTitle } from '@/marketplace/title';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { useTheme } from '@/theme/useTheme';

import { CategoriesList } from '../CategoriesList';
import { OfferingsGroup } from '../OfferingsGroup';
import { OfferingsSearchBox } from '../OfferingsSearchBox';

import { MarketplaceLayoutProps } from './types';

export const ClassicLayout: FC<MarketplaceLayoutProps> = ({ onTagClick }) => {
  const { theme } = useTheme();
  const title = getMarketplaceTitle();

  // Only set by the configuration endpoint when an operator uploaded one.
  const image = ENV.plugins.WALDUR_CORE.MARKETPLACE_HERO_IMAGE
    ? getIconUrl('marketplace_hero_image')
    : theme === 'dark'
      ? DefaultDarkImage
      : DefaultLightImage;

  return (
    <div>
      <LandingHeroSection
        header={translate('Welcome to')}
        title={title}
        context="marketplace"
        backgroundImage={`url(${image})`}
      >
        <OfferingsSearchBox />
      </LandingHeroSection>
      <div className={PAGE_CONTAINER_CLASSNAME}>
        <CategoriesList />
      </div>
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'mb-8')}>
        <OfferingsGroup onTagClick={onTagClick} />
      </div>
    </div>
  );
};
