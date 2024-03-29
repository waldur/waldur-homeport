import React, { FunctionComponent } from 'react';

import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface CreateResourceFormGroupFormGroupProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const CreateResourceFormGroup: FunctionComponent<CreateResourceFormGroupFormGroupProps> =
  ({ label, required, children }) => (
    <>
      {label ? (
        <FormGroup
          labelClassName="col-sm-3"
          valueClassName="col-sm-9"
          label={label}
          required={required}
        >
          {children}
        </FormGroup>
      ) : (
        <FormGroup
          classNameWithoutLabel="offset-sm-3 col-sm-9"
          required={required}
        >
          {children}
        </FormGroup>
      )}
    </>
  );
