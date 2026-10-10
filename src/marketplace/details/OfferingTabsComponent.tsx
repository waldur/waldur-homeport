import React from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

export interface OfferingTab {
  key: string;
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
    <Tabs mount="active" defaultValue={props.tabs[0].key}>
      <TabsList className="border-transparent fw-bold my-6">
        {props.tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="tab-content">
        {props.tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <div className="mt-3">{React.createElement(tab.component)}</div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};
