import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { FilterBar } from '@waldur/marketplace/common/FilterBar';
import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { CategoriesListType } from '@waldur/marketplace/types';

import { products } from '../fixtures';
import { CategoriesList } from './CategoriesList';
import { HeroSection } from './HeroSection';

interface LandingPage extends TranslateProps {
  categories: CategoriesListType;
}

export const LandingPage = props => (
  <div>
    <HeroSection title={props.translate('Explore Waldur Marketplace')}>
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
    <ProductGrid products={products}/>
  </div>
);
