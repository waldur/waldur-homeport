import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { sections } from '@waldur/marketplace/fixtures';

import { FeaturesTab } from './FeaturesTab';
import { OverviewTab } from './OverviewTab';
import './ProductTabs.scss';
import { ScreenshotsTab } from './ScreenshotsTab';
import { SecurityTab } from './SecurityTab';

export const ProductTabs = props => {
  const basicSections = sections.filter(s => s.title !== 'Security');
  const securitySections = [sections.find(s => s.title === 'Security')];

  return (
    <Tabs
      defaultActiveKey="details"
      id="tabs"
      className="m-t-lg product-tabs"
      unmountOnExit={true}
    >
      <Tab eventKey="details" title="Description">
        <div className="m-t-md">
          <OverviewTab product={props.product}/>
        </div>
      </Tab>
      <Tab eventKey="features" title="Features">
        <div className="m-t-md">
          <FeaturesTab product={props.product} sections={basicSections}/>
        </div>
      </Tab>
      <Tab eventKey="screenshots" title="Screenshots">
        <div className="m-t-md">
          <ScreenshotsTab screenshots={props.product.screenshots}/>
        </div>
      </Tab>
      <Tab eventKey="security" title="Security">
        <div className="m-t-md">
          <SecurityTab product={props.product} sections={securitySections}/>
        </div>
      </Tab>
      <Tab eventKey="support" title="Support">
        SLAs table and contacts table.
      </Tab>
    </Tabs>
  );
};
