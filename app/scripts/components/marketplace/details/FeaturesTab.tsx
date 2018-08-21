import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Section, Offering } from '@waldur/marketplace/types';

import { FeatureSection } from './FeatureSection';

interface FeaturesTabProps {
  sections: Section[];
  offering: Offering;
}

export const FeaturesTab = (props: FeaturesTabProps) => (
  <Table
    bordered={true}
    hover={true}
    responsive={true}
  >
     <tbody>
      {props.sections.map((section, index) => (
        <FeatureSection
          key={index}
          section={section}
          offering={props.offering}
        />
      ))}
    </tbody>
  </Table>
);
