import * as React from 'react';

import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

export const HtmlTabList = props => (
  <Tabs defaultActiveKey={0} id="monitoringGuide">
    {props.tabs.map((tab, index) => (
      <Tab eventKey={index} title={tab.title} key={index}>
        <div className="m-t-sm" dangerouslySetInnerHTML={{__html: tab.html}}/>
      </Tab>
    ))}
  </Tabs>
);
