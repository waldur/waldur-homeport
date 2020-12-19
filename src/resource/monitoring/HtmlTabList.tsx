import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';

interface HtmlTab {
  title: string;
  html: string;
}

interface HtmlTabListProps {
  tabs: HtmlTab[];
}

export const HtmlTabList: FunctionComponent<HtmlTabListProps> = (props) => (
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
