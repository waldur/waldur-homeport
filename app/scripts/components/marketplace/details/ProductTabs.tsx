import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { Section, Product } from '@waldur/marketplace/types';

import { FeaturesTab } from './FeaturesTab';
import { OverviewTab } from './OverviewTab';
import './ProductTabs.scss';
import { ScreenshotsTab } from './ScreenshotsTab';

interface ProductTabsProps {
  sections: Section[];
  product: Product;
}

export const ProductTabs = (props: ProductTabsProps) => {
  const basicSections = props.sections.filter(s => s.is_standalone === false);
  const standaloneSections = props.sections.filter(s => s.is_standalone === true);

  return (
    <Tabs
      defaultActiveKey="details"
      id="tabs"
      className="m-t-lg product-tabs"
      unmountOnExit={true}
    >
      <Tab eventKey="details" title={translate('Description')}>
        <div className="m-t-md">
          <OverviewTab product={props.product}/>
        </div>
      </Tab>
      {basicSections.length > 0 && (
        <Tab eventKey="features" title={translate('Features')}>
          <div className="m-t-md">
            <FeaturesTab product={props.product} sections={basicSections}/>
          </div>
        </Tab>
      )}
      {props.product.screenshots && props.product.screenshots.length > 0 && (
        <Tab eventKey="screenshots" title={translate('Screenshots')}>
          <div className="m-t-md">
            <ScreenshotsTab screenshots={props.product.screenshots}/>
          </div>
        </Tab>
      )}
      {standaloneSections.map((section, index) => (
        <Tab key={index} eventKey={index} title={section}>
          <div className="m-t-md">
            <FeaturesTab product={props.product} sections={[section]}/>
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};
