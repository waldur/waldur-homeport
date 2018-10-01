import * as React from 'react';

export const ListCell = values => (
  <div>
    {values.map((value, index) => (
      <div key={index}>
        <i className="text-success fa fa-check"/>
        {' '}
        {value}
      </div>
    ))}
  </div>
);
