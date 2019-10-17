import * as React from 'react';

interface StaticFieldProps {
  label: string;
  value: string;
  labelClass?: string;
  controlClass?: string;
}

export const StaticField: React.FC<StaticFieldProps> = props => {
  return (
    <div className="form-group">
      <label className={`${props.labelClass} control-label`}>
        {props.label}
      </label>
      <div className={props.controlClass}>
        <p className="form-control-static">{props.value}</p>
      </div>
    </div>
  );
};

StaticField.defaultProps = {
  labelClass: 'col-sm-3 col-md-4 col-lg-3',
  controlClass: 'col-sm-9 col-md-8',
};
