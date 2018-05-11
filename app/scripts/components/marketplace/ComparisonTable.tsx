import * as React from 'react';

import { ComparisonItem } from './ComparisonItem';
import { ComparisonSection } from './ComparisonSection';
import { ProductDetails, Section } from './types';

interface ComparisonTableProps {
  items: ProductDetails[];
  sections: Section[];
}

export const ComparisonTable = (props: ComparisonTableProps) => (
  <table className="table table-bordered">
  <tbody>
      <tr>
        <td/>
        {props.items.map((item, index) => (
          <td key={index} style={{width: '20%'}}>
            <ComparisonItem item={item}/>
          </td>
        ))}
      </tr>
      {props.sections.map((section, index) => (
        <ComparisonSection
          key={index}
          section={section}
          items={props.items}
        />
      ))}
    </tbody>
  </table>
);
