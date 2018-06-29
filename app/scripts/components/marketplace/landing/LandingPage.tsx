import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { FilterBar } from '@waldur/marketplace/common/FilterBar';
import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { CategoriesListType, ProductsListType } from '@waldur/marketplace/types';

import { CategoriesList } from './CategoriesList';
import { HeroSection } from './HeroSection';

interface LandingPageProps extends TranslateProps {
  categories: CategoriesListType;
  products: ProductsListType;
}

export const LandingPage = withTranslation((props: LandingPageProps) => (
  <div>
    <HeroSection title={props.translate(
      'Explore {deployment} Marketplace',
      {deployment: ENV.shortPageTitle})}>
      <FilterBar/>
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
    <ProductGrid {...props.products}/>
  </div>
));
