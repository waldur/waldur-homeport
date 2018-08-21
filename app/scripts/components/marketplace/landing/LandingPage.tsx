import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { FilterBarContainer } from '@waldur/marketplace/common/FilterBarContainer';
import { OfferingGrid } from '@waldur/marketplace/common/OfferingGrid';
import { CategoriesListType, OfferingsListType } from '@waldur/marketplace/types';

import { CategoriesList } from './CategoriesList';
import { HeroSection } from './HeroSection';

interface LandingPageProps extends TranslateProps {
  categories: CategoriesListType;
  offerings: OfferingsListType;
}

export const LandingPage = withTranslation((props: LandingPageProps) => (
  <div>
    <HeroSection title={props.translate(
      'Explore {deployment} Marketplace',
      {deployment: ENV.shortPageTitle})}>
      <FilterBarContainer />
    </HeroSection>
    <div className="row">
      <CategoriesList
        translate={props.translate}
        {...props.categories}
      />
    </div>
    <h2 className="m-b-md">
      {props.translate('Recent additions')}
    </h2>
    <OfferingGrid {...props.offerings}/>
  </div>
));
