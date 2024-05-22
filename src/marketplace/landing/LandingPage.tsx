import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { NewbiesGuideNotification } from '@waldur/dashboard/hero/NewbiesGuideNotification';
import { translate } from '@waldur/i18n';
import {
  isExperimentalUiComponentsVisible,
  useMarketplacePublicTabs,
} from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { CategoriesList } from './CategoriesList';
import { OfferingsGroup } from './OfferingsGroup';
import { OfferingsSearchBox } from './OfferingsSearchBox';

import './LandingPage.scss';

export const LandingPage: FC<{}> = () => {
  useFullPage();
  useTitle(translate('Marketplace'));

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  useMarketplacePublicTabs();
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
      <div className="container-xxl mt-20 mb-10">
        <CategoriesList />
      </div>
      <div className="container-xxl mb-20">
        <OfferingsGroup />
      </div>
    </div>
  );
};
