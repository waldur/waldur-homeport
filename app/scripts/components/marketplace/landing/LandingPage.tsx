import * as React from 'react';

import { FilterBar } from '@waldur/marketplace/common/FilterBar';
import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { connectAngularComponent } from '@waldur/store/connect';

import { categories, products } from '../fixtures';
import { CategoryCard } from './CategoryCard';
import { HeroSection } from './HeroSection';

export const LandingPage = () => (
  <div>
    <HeroSection title="Explore Waldur Marketplace">
      <FilterBar/>
    </HeroSection>
    <div className="row">
      {categories.map((category, index) => (
        <div key={index} className="col-md-3 col-sm-6">
          <CategoryCard category={category}/>
        </div>
      ))}
    </div>
    <h2 className="m-b-md">Recent additions</h2>
    <ProductGrid products={products}/>
  </div>
);

export default connectAngularComponent(LandingPage);
