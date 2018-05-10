import * as React from 'react';

import { ProductDetails, Section } from './types';

interface ComparisonSectionProps {
  items: ProductDetails[];
  section: Section;
}

export const ComparisonSection = (props: ComparisonSectionProps) => (
  <>
    <tr>
      <th>{props.section.title}</th>
      {props.items.map((item, index) => (
        <td key={index}>
          {item.title}
        </td>
      ))}
    </tr>
    {props.section.features.map((feature, index1) => (
      <tr key={index1}>
        <td>
          {feature.title}
        </td>
        {props.items.map((item, index2) => (
          <td key={index2}>
            {item[feature.key]}
          </td>
        ))}
      </tr>
    ))}
  </>
);
