import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { ComparisonTable } from './ComparisonTable';
import { products, sections } from './fixtures';

const MarketplaceComparison = () => (
  <ComparisonTable sections={sections} items={products}/>
);

export default connectAngularComponent(MarketplaceComparison);
