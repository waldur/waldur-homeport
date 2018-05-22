import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { DetailsTab } from './DetailsTabs';
import { ProductFeatures } from './ProductFeatures';
import { ProductGallery } from './ProductGallery';

import './ProductTabs.scss';

export const ProductTabs = props => (
  <Tabs
    defaultActiveKey="details"
    id="tabs"
    className="m-t-lg product-tabs"
  >
    <Tab eventKey="details" title="Description">
      <DetailsTab product={props.product}/>
    </Tab>
    <Tab eventKey="features" title="Features">
      <ProductFeatures product={props.product}/>
    </Tab>
    <Tab eventKey="screenshots" title="Screenshots">
      <ProductGallery screenshots={props.product.screenshots}/>
    </Tab>
  </Tabs>
);
