import { FC } from 'react';
import { useSelector } from 'react-redux';

import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import DefaultDarkImage from '@waldur/dashboard/hero/servers-room-dark.png';
import DefaultLightImage from '@waldur/dashboard/hero/servers-room-light.png';
import { translate } from '@waldur/i18n';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';
import {
  useExtraToolbar,
  useFullPage,
  useToolbarActions,
} from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { useTheme } from '@waldur/theme/useTheme';

import { CategoriesList } from './CategoriesList';
import { PageBarFilters } from './filter/PageBarFilters';
import { getMarketplaceFilters } from './filter/store/selectors';
import { MarketplaceLandingFilter } from './MarketplaceLandingFilter';
import { OfferingsGroup } from './OfferingsGroup';
import { OfferingsSearchBox } from './OfferingsSearchBox';

export const LandingPage: FC<{}> = () => {
  useTitle(
    ENV.plugins.WALDUR_CORE.MARKETPLACE_LANDING_PAGE ||
      translate('Marketplace'),
  );
  useFullPage();

  const { theme } = useTheme();

  useMarketplacePublicTabs();

  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);

  const backendImage = getIconUrl('marketplace_hero_image');
  const defaultImage = theme === 'dark' ? DefaultDarkImage : DefaultLightImage;

  return (
    <div className="marketplace-landing-page">
      <LandingHeroSection
        header={translate('Welcome to')}
        title={
          ENV.plugins.WALDUR_CORE.MARKETPLACE_LANDING_PAGE ||
          translate('Marketplace')
        }
        context="marketplace"
        backgroundImage={`url(${backendImage}), url(${defaultImage})`}
      >
        <div className="d-flex justify-content-center">
          <OfferingsSearchBox />
        </div>
      </LandingHeroSection>
      <div className="container-fluid">
        <CategoriesList />
      </div>
      <div className="container-fluid mb-10">
        <OfferingsGroup />
      </div>
    </div>
  );
};
