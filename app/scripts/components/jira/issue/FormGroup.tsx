import * as React from 'react';

import { FieldError } from './FieldError';

export const FormGroup = ({input, required, label, meta: {error}, children, ...rest}) => (
  <div className="form-group">
    <label className="control-label">
      {label}{required && <span className="text-danger"> *</span>}
    </label>
    {React.cloneElement(children, {input, ...rest})}
    <FieldError error={error}/>
  </div>
);
