import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Section, Offering } from '@waldur/marketplace/types';

import { AttributeSection } from './AttributeSection';

interface AttributesTableProps {
  sections: Section[];
  offering: Offering;
}

export const AttributesTable = (props: AttributesTableProps) => (
  <Table
    bordered={true}
    hover={true}
    responsive={true}
  >
     <tbody>
      {props.sections.map((section, index) => (
        <AttributeSection
          key={index}
          section={section}
          offering={props.offering}
          hideHeader={props.sections.length === 1}
        />
      ))}
    </tbody>
  </Table>
);
