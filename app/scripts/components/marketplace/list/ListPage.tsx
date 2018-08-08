import * as React from 'react';

import { categories } from '@waldur/marketplace/fixtures';
import { connectAngularComponent } from '@waldur/store/connect';

import { ShopGrid } from './ShopGrid';

const ListPage = () => (
  <ShopGrid categories={categories}/>
);

export default connectAngularComponent(ListPage);
