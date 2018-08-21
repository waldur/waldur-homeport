import * as React from 'react';

import { range } from '@waldur/core/utils';

import { Offering, Section } from '../types';
import { ComparisonItem } from './ComparisonItem';
import { ComparisonItemPlaceholder } from './ComparisonItemPlaceholder';
import { ComparisonSection } from './ComparisonSection';

interface ComparisonTableProps {
  items: Offering[];
  sections: Section[];
}

export const ComparisonTable = (props: ComparisonTableProps) => (
  <div className="table-responsive">
    <table className="table table-bordered table-hover">
      <tbody>
        <tr>
          <td style={{width: '20%'}}/>
          {props.items.map((item, index) => (
            <td key={index} style={{width: '20%'}}>
              <ComparisonItem item={item}/>
            </td>
          ))}
          {range(4 - props.items.length).map(index =>
            <ComparisonItemPlaceholder key={index}/>
          )}
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
  </div>
);
