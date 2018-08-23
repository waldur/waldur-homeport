import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { ShopGrid } from './ShopGrid';

const ListPage = () => (
  <ShopGrid />
);

export default connectAngularComponent(ListPage);
