import * as React from 'react';

export const FormGroup = props => (
  <div className="form-group">
    <label className="control-label col-sm-3">
      {props.label}
    </label>
    <div className="col-sm-9">
      {props.children}
    </div>
  </div>
);
