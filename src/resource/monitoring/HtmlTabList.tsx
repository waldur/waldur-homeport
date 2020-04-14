import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { FormattedHtml } from '@waldur/core/FormattedHtml';

interface HtmlTab {
  title: string;
  html: string;
}

interface HtmlTabListProps {
  tabs: HtmlTab[];
}

export const HtmlTabList = (props: HtmlTabListProps) => (
  <Tabs defaultActiveKey={0} id="htmlTabList">
    {props.tabs.map((tab, index) => (
      <Tab eventKey={index} title={tab.title} key={index}>
        <div className="m-t-sm">
          <FormattedHtml html={tab.html} />
        </div>
      </Tab>
    ))}
  </Tabs>
);
