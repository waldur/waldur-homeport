import * as React from 'react';

import { AttributeCell } from '@waldur/marketplace/common/AttributeCell';
import { Offering, Attribute } from '@waldur/marketplace/types';

interface AttributeRowProps {
  offering: Offering;
  attribute: Attribute;
}

export const AttributeRow = (props: AttributeRowProps) => (
  <tr>
    <td className="col-md-3">
      {props.attribute.title}
    </td>
    <AttributeCell
      className="col-md-9"
      attr={props.attribute}
      value={props.offering.attributes[props.attribute.key]}
    />
  </tr>
);
