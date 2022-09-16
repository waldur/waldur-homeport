import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  CategoriesListType,
  OfferingsListType,
} from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { CategoriesList } from './CategoriesList';
import { DeploymentIntroduction } from './DeploymentIntroduction';
import { FooterSection } from './FooterSection';
import { HeroSection } from './HeroSection';
import { OfferingsGroup } from './OfferingsGroup';
import { ProvidersBrands } from './ProvidersBrands';

import './LandingPage.scss';

interface LandingPageProps {
  categories: CategoriesListType;
  offerings: OfferingsListType;
  loadOfferings: (
    query: string,
    prevOptions,
    additional: { page: number },
  ) => any;
  gotoOffering: (offeringId: string) => void;
}

export const LandingPage = (props: LandingPageProps) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <div className="marketplace-landing-page">
      <HeroSection
        title={
          ENV.marketplaceLandingPageTitle ||
          translate('{deployment} Marketplace', {
            deployment: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
          })
        }
      >
        <Link
          state="marketplace-categories-profile"
          className="btn text-black btn-bg-white btn-hover-rise"
        >
          {translate('Browse all categories')}
        </Link>
      </HeroSection>
      <div className="container-xxl mb-20">
        <CategoriesList {...props.categories} />
        <ProvidersBrands />
        <h2 className="mb-10 text-center">{translate('Featured offerings')}</h2>
        <OfferingsGroup {...props.offerings} />
      </div>
      {showExperimentalUiComponents && <DeploymentIntroduction />}
      <div className="container-xxl mb-20">
        <h2 className="mb-10 text-center">{translate('Recent offerings')}</h2>
        <OfferingsGroup {...props.offerings} />
      </div>
      {showExperimentalUiComponents && <FooterSection />}
    </div>
  );
};
