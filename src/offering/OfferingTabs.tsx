import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { Offering } from '@waldur/offering/types';

import { OfferingEvents } from './OfferingEvents';
import { OfferingHeader } from './OfferingHeader';

interface OfferingTabsProps extends TranslateProps {
  offering: Offering;
  summary: string;
}

export const PureOfferingTabs = (props: OfferingTabsProps) => (
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
