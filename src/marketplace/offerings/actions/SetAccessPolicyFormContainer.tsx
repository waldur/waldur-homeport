import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { FormContainer } from '@waldur/form';
import { OrganizationGroup } from '@waldur/marketplace/types';

interface SetAccessPolicyFormContainerProps {
  organizationGroups: OrganizationGroup[];
  submitting: boolean;
}

export const SetAccessPolicyFormContainer: FunctionComponent<SetAccessPolicyFormContainerProps> =
  ({ organizationGroups, submitting }) => (
    <FormContainer submitting={submitting}>
      {organizationGroups.map((organizationGroup) => (
        <Field
          key={organizationGroup.uuid}
          name={organizationGroup.uuid}
          component={(prop) => (
            <AwesomeCheckbox label={organizationGroup.name} {...prop.input} />
          )}
        />
      ))}
    </FormContainer>
  );
