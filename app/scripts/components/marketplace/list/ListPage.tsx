import * as React from 'react';

import { products, categories } from '@waldur/marketplace/fixtures';
import { connectAngularComponent } from '@waldur/store/connect';

import { ShopGrid } from './ShopGrid';

const ListPage = () => (
  <ShopGrid products={products} categories={categories}/>
);

export default connectAngularComponent(ListPage);
