import { FC } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { NewbiesGuideNotification } from '@waldur/dashboard/hero/NewbiesGuideNotification';
import { translate } from '@waldur/i18n';
import {
  isExperimentalUiComponentsVisible,
  useMarketplacePublicTabs,
} from '@waldur/marketplace/utils';
import {
  useExtraToolbar,
  useFullPage,
  useToolbarActions,
} from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { CategoriesList } from './CategoriesList';
import { PageBarFilters } from './filter/PageBarFilters';
import { getMarketplaceFilters } from './filter/store/selectors';
import { MarketplaceLandingFilter } from './MarketplaceLandingFilter';
import { OfferingsGroup } from './OfferingsGroup';
import { OfferingsSearchBox } from './OfferingsSearchBox';

import './LandingPage.scss';

export const LandingPage: FC<{}> = () => {
  useFullPage();
  useTitle(translate('Marketplace'));

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  useMarketplacePublicTabs();

  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null);

  return (
    <div className="marketplace-landing-page">
      {showExperimentalUiComponents && (
        <NewbiesGuideNotification
          guideState="public.marketplace-landing"
          message={translate('New to {org} marketplace?', {
            org: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
          })}
        />
      )}
      <LandingHeroSection
        header={translate('Welcome to')}
        title={ENV.marketplaceLandingPageTitle || translate('Marketplace')}
      >
        <div className="d-flex justify-content-center">
          <OfferingsSearchBox />
        </div>
      </LandingHeroSection>
      <div className="container-fluid mt-20 mb-10">
        <CategoriesList />
      </div>
      <div className="container-fluid mb-20">
        <OfferingsGroup />
      </div>
    </div>
  );
};
