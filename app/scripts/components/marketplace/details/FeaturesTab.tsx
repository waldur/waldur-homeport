import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Section, Product } from '@waldur/marketplace/types';

import { FeatureSection } from './FeatureSection';

interface FeaturesTabProps {
  sections: Section[];
  product: Product;
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
          product={props.product}
        />
      ))}
    </tbody>
  </Table>
);
