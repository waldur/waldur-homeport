import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import './OfferingTabs.scss';

export interface OfferingTab {
  title: React.ReactNode;
  component: React.SFC<{}>;
}

interface OfferingTabsComponentProps {
  tabs: OfferingTab[];
}

export const OfferingTabsComponent: React.SFC<OfferingTabsComponentProps> = props => {
  if (props.tabs.length === 0) {
    return null;
  }
  return (
    <Tabs
      defaultActiveKey="tab-0"
      id="tabs"
      className="m-t-lg offering-tabs"
      unmountOnExit={true}
    >
      {props.tabs.map((tab, index) => (
        <Tab key={index} eventKey={`tab-${index}`} title={tab.title}>
          <div className="m-t-md">
            {React.createElement(tab.component)}
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};
