import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

export interface OfferingTab {
  title: React.ReactNode;
  component: React.FC;
  visible: boolean;
}

interface OfferingTabsComponentProps {
  tabs: OfferingTab[];
}

export const OfferingTabsComponent: React.FC<OfferingTabsComponentProps> = (
  props,
) => {
  if (props.tabs.length === 0) {
    return null;
  }
  return (
    <Tabs
      defaultActiveKey="tab-0"
      id="offering-tabs"
      className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fw-bold"
      unmountOnExit={true}
    >
      {props.tabs.map((tab, index) => (
        <Tab key={index} eventKey={`tab-${index}`} title={tab.title}>
          <div className="mt-3">{React.createElement(tab.component)}</div>
        </Tab>
      ))}
    </Tabs>
  );
};
