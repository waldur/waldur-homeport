import * as React from 'react';

import { ListCell } from './ListCell';

const getOptions = attribute =>
  attribute.options.reduce((map, item) => ({...map, [item.key]: item.title}), {});

export const AttributeRow = ({ offering, attribute }) => {
  let value = offering.attributes[attribute.key];
  if (attribute.type === 'list' && typeof value === 'object') {
    const options = getOptions(attribute);
    value = value.map(item => options[item]);
    value = ListCell(value);
  } else if (attribute.type === 'choice') {
    const options = getOptions(attribute);
    value = options[value];
  }
  return (
    <tr>
      <td className="col-md-3">
        {attribute.title}
      </td>
      <td className="col-md-9">
        {value}
      </td>
    </tr>
  );
};
