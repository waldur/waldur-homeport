import * as React from 'react';

import { FieldError } from './FieldError';

export const withLabel = WrappedComponent => ({label, ...props}) => (
  <div className="form-group">
    <label className="control-label">
      {label}:
    </label>
    <WrappedComponent {...props}/>
    {props.meta && <FieldError error={props.meta.error}/>}
  </div>
);
