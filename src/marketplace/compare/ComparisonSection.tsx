import * as React from 'react';

import { range } from '@waldur/core/utils';
import { AttributeCell } from '@waldur/marketplace/common/AttributeCell';
import { COMPARISON_COLUMNS } from '@waldur/marketplace/compare/store/constants';

import { ComparedOffering, Section } from '../types';

interface ComparisonSectionProps {
  items: ComparedOffering[];
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
      {props.items.length < COMPARISON_COLUMNS && range(COMPARISON_COLUMNS - props.items.length).map(index =>
        <td key={index}/>
      )}
    </tr>
    {props.section.attributes.map((attribute, index1) => (
      <tr key={index1}>
        <td>
          {attribute.title}
        </td>
        {props.items.map((item, index2) => (
          <td key={index2}>
            <AttributeCell
              attr={attribute}
              value={item.attributes[attribute.key]}
            />
          </td>
        ))}
        {props.items.length < COMPARISON_COLUMNS && range(COMPARISON_COLUMNS - props.items.length).map(index =>
          <td key={index}/>
        )}
      </tr>
    ))}
  </>
);
