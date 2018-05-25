import * as React from 'react';

import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { connectAngularComponent } from '@waldur/store/connect';

import { categories, products } from '../fixtures';
import { CategoryCard } from './CategoryCard';
import { HeroSection } from './HeroSection';

export const LandingPage = () => (
  <div>
    <HeroSection
      header="Explore Waldur Marketplace"
      placeholder="Search for apps and services..."
      buttonLabel="Search"
    />
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
