import { FunctionComponent } from 'react';
import { NestedSection } from 'waldur-js-client';

import { AttributeSection } from './AttributeSection';

interface AttributesTableProps {
  sections: NestedSection[];
  attributes: any;
}

export const AttributesTable: FunctionComponent<AttributesTableProps> = (
  props,
) => (
  <div className="flex flex-col gap-4">
    {props.sections.map((section, index) => (
      <AttributeSection
        key={index}
        section={section}
        attributes={props.attributes}
        hideHeader={props.sections.length === 1}
      />
    ))}
  </div>
);
