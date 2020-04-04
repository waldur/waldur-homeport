import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { TranslateProps } from '@waldur/i18n';

import { FlavorsList } from './FlavorsList';
import { ImagesList } from './ImagesList';

export const VmTypeOverview = (props: TranslateProps) => (
  <Tabs defaultActiveKey={1} id="vm-overview">
    <Tab eventKey={1} title={props.translate('Images')}>
      <div className="m-t-sm">
        <ImagesList />
      </div>
    </Tab>
    <Tab eventKey={2} title={props.translate('Flavors')}>
      <div className="m-t-sm">
        <FlavorsList />
      </div>
    </Tab>
  </Tabs>
);
