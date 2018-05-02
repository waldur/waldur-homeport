import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { VMFlavors } from '@waldur/analytics/VMFlavors';
import { VMImages } from '@waldur/analytics/VMImages';

export const VMTypeOverview = props => (
  <Tabs defaultActiveKey={1} id="vm-type-overview">
    <Tab eventKey={1} title={props.translate('Images')}>
      <div className="m-t-sm">
        <VMImages />
      </div>
    </Tab>
    <Tab eventKey={2} title={props.translate('Flavors')}>
      <div className="m-t-sm">
        <VMFlavors />
      </div>
    </Tab>
  </Tabs>
);
