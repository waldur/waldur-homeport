import * as React from 'react';

import { Section, Offering } from '@waldur/marketplace/types';

import { AttributeRow } from './AttributeRow';

interface FeatureSectionProps {
  section: Section;
  offering: Offering;
  hideHeader: boolean;
}

export const FeatureSection = (props: FeatureSectionProps) => (
  <>
    {!props.hideHeader && (
      <tr className="gray-bg">
        <th>{props.section.title}</th>
        <th/>
      </tr>
    )}
    {props.section.attributes
      .filter(attr => props.offering.attributes.hasOwnProperty(attr.key))
      .map((attr, index) => (
        <AttributeRow
          key={index}
          offering={props.offering}
          attribute={attr}/>
    ))}
  </>
);
