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
    <thead>
      <tr>
        <td/>
        {props.items.map((item, index) => (
          <td key={index} className="col-md-3">
            <ComparisonItem item={item}/>
          </td>
        ))}
      </tr>
    </thead>
    <tbody>
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
