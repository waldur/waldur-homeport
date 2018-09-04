import * as React from 'react';

export const OfferingPlanFormGroup = props => (
  <div className="form-group">
    <label className="control-label col-sm-3">
      {props.label}
    </label>
    <div className="col-sm-9">
      <input
        className="form-control"
        {...props.input}
        type={props.type}
      />
    </div>
  </div>
);
