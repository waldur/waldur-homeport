import * as React from 'react';

export const OpenStackSubnetField = props => {
  const [prefix, suffix] = props.mask.split('X');
  return (
    <div className="col-sm-8 input-group">
      <span className="input-group-addon">
        {prefix}
      </span>
      <input
        type="number"
        min="1"
        max="255"
        className="form-control"
        {...props.input}
      />
      <span className="input-group-addon">
        {suffix}
      </span>
    </div>
  );
};
