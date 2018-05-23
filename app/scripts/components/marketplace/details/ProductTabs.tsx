import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { FeaturesTab } from './FeaturesTab';
import { OverviewTab } from './OverviewTab';
import './ProductTabs.scss';
import { ScreenshotsTab } from './ScreenshotsTab';

export const ProductTabs = props => (
  <Tabs
    defaultActiveKey="details"
    id="tabs"
    className="m-t-lg product-tabs"
  >
    <Tab eventKey="details" title="Description">
      <OverviewTab product={props.product}/>
    </Tab>
    <Tab eventKey="features" title="Features">
      <FeaturesTab product={props.product}/>
    </Tab>
    <Tab eventKey="screenshots" title="Screenshots">
      <ScreenshotsTab screenshots={props.product.screenshots}/>
    </Tab>
    <Tab eventKey="security" title="Security">
      Security
    </Tab>
    <Tab eventKey="support" title="Support">
      Security
    </Tab>
  </Tabs>
);
