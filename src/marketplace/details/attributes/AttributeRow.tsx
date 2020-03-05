import * as React from 'react';

import { AttributeCell } from '@waldur/marketplace/common/AttributeCell';
import { Attribute } from '@waldur/marketplace/types';

interface AttributeRowProps {
  value: any;
  attribute: Attribute;
}

export const AttributeRow = (props: AttributeRowProps) => (
  <tr>
    <td className="col-md-3">{props.attribute.title}</td>
    <td className="col-md-9">
      <AttributeCell attr={props.attribute} value={props.value} />
    </td>
  </tr>
);
