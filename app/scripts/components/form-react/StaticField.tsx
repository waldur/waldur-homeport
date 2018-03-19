import * as React from 'react';

interface StaticFieldProps {
  label: string;
  value: string;
}

export const StaticField = (props: StaticFieldProps) => {
  return (
    <div className="form-group">
      <label className="col-sm-3 col-md-4 col-lg-3 control-label">
        {props.label}
      </label>
      <div className="col-sm-9 col-md-8">
        <p className="form-control-static">{props.value}</p>
      </div>
    </div>
  );
};
