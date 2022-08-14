import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { FormContainer } from '@waldur/form';
import { Division } from '@waldur/marketplace/types';

interface SetAccessPolicyFormContainerProps {
  divisions: Division[];
  submitting: boolean;
}

export const SetAccessPolicyFormContainer: FunctionComponent<SetAccessPolicyFormContainerProps> =
  ({ divisions, submitting }) => (
    <FormContainer submitting={submitting}>
      {divisions.map((division) => (
        <Field
          key={division.uuid}
          name={division.uuid}
          component={(prop) => (
            <AwesomeCheckbox label={division.name} {...prop.input} />
          )}
        />
      ))}
    </FormContainer>
  );
