import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { withTranslation } from '@waldur/i18n';

import { OfferingEvents } from './OfferingEvents';
import { OfferingHeader } from './OfferingHeader';

export const PureOfferingTabs = props => (
  <div className="ibox">
    <div className="ibox-content">
      <Tabs unmountOnExit={true} defaultActiveKey="summary" id="offeringSummary">
        <Tab title={props.translate('Summary')} eventKey="summary">
          <div className="m-t-sm">
            <OfferingHeader
              offering={props.offering}
              summary={props.summary}/>
          </div>
        </Tab>
        <Tab title={props.translate('Audit log')} eventKey="events">
          <div className="m-t-sm">
            <OfferingEvents offering={props.offering}/>
          </div>
        </Tab>
      </Tabs>
    </div>
  </div>
);

export const OfferingTabs = withTranslation(PureOfferingTabs);
