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

export const OfferingTabs = (props: OfferingTabsProps) => {
  const basicSections = props.sections.filter(s => s.is_standalone === false);
  const standaloneSections = props.sections.filter(s => s.is_standalone === true);

  return (
    <Tabs
      defaultActiveKey="details"
      id="tabs"
      className="m-t-lg offering-tabs"
      unmountOnExit={true}
    >
      <Tab eventKey="details" title={translate('Description')}>
        <div className="m-t-md">
          <OverviewTab offering={props.offering}/>
        </div>
      </Tab>
      {basicSections.length > 0 && (
        <Tab eventKey="features" title={translate('Features')}>
          <div className="m-t-md">
            <FeaturesTab offering={props.offering} sections={basicSections}/>
          </div>
        </Tab>
      )}
      {props.offering.screenshots && props.offering.screenshots.length > 0 && (
        <Tab eventKey="screenshots" title={translate('Screenshots')}>
          <div className="m-t-md">
            <ScreenshotsTab screenshots={props.offering.screenshots}/>
          </div>
        </Tab>
      )}
      {standaloneSections.map((section, index) => (
        <Tab key={index} eventKey={index} title={section}>
          <div className="m-t-md">
            <FeaturesTab offering={props.offering} sections={[section]}/>
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};
