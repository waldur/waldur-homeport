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
  <div className="table-responsive">
    <table className="table table-bordered table-hover">
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
    </table>
  </div>
);
