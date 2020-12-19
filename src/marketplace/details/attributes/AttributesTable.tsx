import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { Section } from '@waldur/marketplace/types';

import { AttributeSection } from './AttributeSection';

interface AttributesTableProps {
  sections: Section[];
  attributes: any;
}

export const AttributesTable: FunctionComponent<AttributesTableProps> = (
  props,
) => (
  <Table bordered={true} hover={true} responsive={true}>
    <tbody>
      {props.sections.map((section, index) => (
        <AttributeSection
          key={index}
          section={section}
          attributes={props.attributes}
          hideHeader={props.sections.length === 1}
        />
      ))}
    </tbody>
  </Table>
);
