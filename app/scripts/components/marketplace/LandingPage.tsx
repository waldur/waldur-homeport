import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { categories } from './fixtures';
import { HeroSection } from './HeroSection';
import { ProductCategory } from './ProductCategory';

export const LandingPage = () => (
  <div>
    <HeroSection
      header="Explore Waldur Marketplace"
      placeholder="Search for apps and services..."
      buttonLabel="Search"
    />
    {categories.map((category, index) => (
      <ProductCategory category={category} key={index}/>
    ))}
  </div>
);

export default connectAngularComponent(LandingPage);
