import * as React from 'react';

import { range } from '@waldur/core/utils';
import { products, categories } from '@waldur/marketplace/fixtures';
import { connectAngularComponent } from '@waldur/store/connect';

import { ShopGrid } from './ShopGrid';

const repeatedProducts = range(12).map(i => products[i % products.length]);

const ListPage = () => (
  <ShopGrid products={repeatedProducts} categories={categories}/>
);

export default connectAngularComponent(ListPage);
