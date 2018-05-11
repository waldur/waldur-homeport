import * as React from 'react';

export const ComparisonItemPlaceholder = () => (
  <td style={{
    width: '20%',
    verticalAlign: 'middle',
    textAlign: 'center',
  }}>
    <h3>
      <a>
        <i className="fa fa-plus-circle"/>
        {' '}
        Add item
      </a>
    </h3>
  </td>
);
