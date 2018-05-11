import * as React from 'react';

import { ProductDetails, Section } from './types';

interface ComparisonSectionProps {
  items: ProductDetails[];
  section: Section;
}

export const ComparisonSection = (props: ComparisonSectionProps) => (
  <>
    <tr className="gray-bg">
      <th>{props.section.title}</th>
      {props.items.map((item, index) => (
        <th key={index}>
          {item.title}
        </th>
      ))}
    </tr>
    {props.section.features.map((feature, index1) => (
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
      </tr>
    ))}
  </>
);
