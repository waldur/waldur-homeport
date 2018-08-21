import * as React from 'react';

import { ListCell } from '@waldur/marketplace/common/ListCell';
import { Section, Offering } from '@waldur/marketplace/types';

interface FeatureSectionProps {
  section: Section;
  offering: Offering;
}

const getOptions = attribute =>
  attribute.options.reduce((map, item) => ({...map, [item.key]: item.title}), {});

const AttributeRow = ({ offering, attribute }) => {
  let value = offering.attributes[attribute.key];
  if (attribute.type === 'list' && typeof value === 'object') {
    const options = getOptions(attribute);
    value = value.map(item => options[item]);
    value = ListCell(value);
  } else if (attribute.type === 'choice') {
    const options = getOptions(attribute);
    value = options[value];
  }
  return (
    <tr>
      <td className="col-md-3">
        {attribute.title}
      </td>
      <td className="col-md-9">
        {value}
      </td>
    </tr>
  );
};

export const FeatureSection = (props: FeatureSectionProps) => (
  <>
    <tr className="gray-bg">
      <th>{props.section.title}</th>
      <th/>
    </tr>
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
