import * as React from 'react';

import { range } from '@waldur/core/utils';

import { Offering, Section } from '../types';

interface ComparisonSectionProps {
  items: Offering[];
  section: Section;
}

export const ComparisonSection = (props: ComparisonSectionProps) => (
  <>
    <tr className="gray-bg">
      <th>{props.section.title}</th>
      {props.items.map((item, index) => (
        <th key={index}>
          {item.name}
        </th>
      ))}
      {range(4 - props.items.length).map(index =>
        <td key={index}/>
      )}
    </tr>
    {props.section.attributes.map((feature, index1) => (
      <tr key={index1}>
        <td>
          {feature.title}
        </td>
        {props.items.map((item, index2) => (
          <td key={index2}>
            {
              feature.render ?
              feature.render(item[feature.key]) :
              item[feature.key]
            }
          </td>
        ))}
        {range(4 - props.items.length).map(index =>
          <td key={index}/>
        )}
      </tr>
    ))}
  </>
);
