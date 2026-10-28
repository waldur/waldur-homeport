import { FunctionComponent } from 'react';
import { NestedAttribute } from 'waldur-js-client';

import { AttributeCell } from '@/marketplace/common/AttributeCell';

interface AttributeRowProps {
  value: any;
  attribute: NestedAttribute;
}

export const AttributeRow: FunctionComponent<AttributeRowProps> = (props) => (
  <tr>
    <td className="md:w-3/12">{props.attribute.title}</td>
    <td className="md:w-9/12">
      <AttributeCell attr={props.attribute} value={props.value} />
    </td>
  </tr>
);
