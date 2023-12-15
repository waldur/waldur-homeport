import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import {
  isExperimentalUiComponentsVisible,
  useMarketplacePublicTabs,
} from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { AllCategoriesLink } from '../links/AllCategoriesLink';

import { CategoriesList } from './CategoriesList';
import { DeploymentIntroduction } from './DeploymentIntroduction';
import { FooterSection } from './FooterSection';
import { HeroSection } from './HeroSection';
import { useLandingCategories, useLandingOfferings } from './hooks';
import { OfferingsGroup } from './OfferingsGroup';
import { ProvidersBrands } from './ProvidersBrands';

import './LandingPage.scss';

export const LandingPage: FC<{}> = () => {
  useFullPage();
  useTitle(translate('Marketplace'));

  useMarketplacePublicTabs();

  const categories = useLandingCategories();
  const offerings = useLandingOfferings();

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <div className="marketplace-landing-page">
      <HeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={ENV.marketplaceLandingPageTitle || translate('Marketplace')}
      >
        <AllCategoriesLink className="btn text-black btn-bg-white btn-hover-rise">
          {translate('Browse all categories')}
        </AllCategoriesLink>
      </HeroSection>
      <div className="container-xxl mb-20">
        <CategoriesList {...categories} />
        <ProvidersBrands />
        <h2 className="mb-10 text-center">{translate('Featured offerings')}</h2>
        <OfferingsGroup {...offerings} />
      </div>
      {showExperimentalUiComponents && <DeploymentIntroduction />}
      <div className="container-xxl mb-20">
        <h2 className="mb-10 text-center">{translate('Recent offerings')}</h2>
        <OfferingsGroup {...offerings} />
      </div>
      {showExperimentalUiComponents && <FooterSection />}
    </div>
  );
};
