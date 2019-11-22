import * as React from 'react';

export const IntegerUnitField = props => (
  <div className="input-group" style={{maxWidth: 200}}>
    <input
      {...props.input}
      type="number"
      className="form-control"
      min="0"
    />
    <span className="input-group-addon">
      {props.units}
    </span>
  </div>
);
