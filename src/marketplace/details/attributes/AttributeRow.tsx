import { FunctionComponent } from 'react';
import { NestedAttribute } from 'waldur-js-client';

import { AttributeCell } from '@/marketplace/common/AttributeCell';

interface AttributeRowProps {
  value: any;
  attribute: NestedAttribute;
}

export const AttributeRow: FunctionComponent<AttributeRowProps> = (props) => (
  <tr>
    <td className="col-md-3">{props.attribute.title}</td>
    <td className="col-md-9">
      <AttributeCell attr={props.attribute} value={props.value} />
    </td>
  </tr>
);
