import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { CategoryCard } from './CategoryCard';
import { features, categories } from './fixtures';
import { HeroSection } from './HeroSection';
import { ProductCategory } from './ProductCategory';

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
    <ProductCategory category={features}/>
  </div>
);

export default connectAngularComponent(LandingPage);
