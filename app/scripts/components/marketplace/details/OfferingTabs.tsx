import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { Section, Offering } from '@waldur/marketplace/types';

import { FeaturesTab } from './FeaturesTab';
import './OfferingTabs.scss';
import { OverviewTab } from './OverviewTab';
import { ScreenshotsTab } from './ScreenshotsTab';

interface OfferingTabsProps {
  sections: Section[];
  offering: Offering;
}

const getTabs = (props: OfferingTabsProps) => {
  const basicSections = props.sections.filter(s => s.is_standalone === false);
  const standaloneSections = props.sections.filter(s => s.is_standalone === true);

  let tabs = [
    {
      visible: props.offering.full_description,
      title: translate('Description'),
      component: () => <OverviewTab offering={props.offering}/>,
    },
    {
      visible: basicSections.length > 0,
      title: translate('Features'),
      component: () => <FeaturesTab offering={props.offering} sections={basicSections}/>,
    },
    {
      visible: props.offering.screenshots.length > 0,
      title: translate('Screenshots'),
      component: () => <ScreenshotsTab screenshots={props.offering.screenshots}/>,
    },
  ];

  standaloneSections.forEach(section => {
    tabs.push({
      visible: true,
      title: section.title,
      component: () => <FeaturesTab offering={props.offering} sections={[section]}/>,
    });
  });
  tabs = tabs.filter(tab => tab.visible);
  return tabs;
};

export const OfferingTabs = (props: OfferingTabsProps) => (
  <Tabs
    defaultActiveKey="tab-0"
    id="tabs"
    className="m-t-lg offering-tabs"
    unmountOnExit={true}
  >
    {getTabs(props).map((tab, index) => (
      <Tab key={index} eventKey={`tab-${index}`} title={tab.title}>
        <div className="m-t-md">
          {tab.component()}
        </div>
      </Tab>
    ))}
  </Tabs>
);
