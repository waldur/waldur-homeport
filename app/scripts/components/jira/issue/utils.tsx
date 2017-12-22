import * as React from 'react';

export const withLabel = WrappedComponent => ({label, ...props}) => (
  <div className="form-group">
    <label className="control-label">
      {label}:
    </label>
    <WrappedComponent {...props}/>
  </div>
);
