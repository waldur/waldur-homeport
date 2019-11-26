import * as React from 'react';
import { FieldArray } from 'redux-form';

import { TextField, FormContainer, SelectField} from '@waldur/form-react';
import { translate } from '@waldur/i18n';

import { EnvironmentVariablesList } from './EnvironmentVariablesList';

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python 3.7',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'sh',
  },
];

export const ScriptsForm = ({ container }) => (
  <>
    <FormContainer {...container}>
      <SelectField
        name="language"
        label={translate('Script language')}
        options={PROGRAMMING_LANGUAGE_CHOICES}
        simpleValue={true}
        required={true}
      />
      <TextField
        name="create"
        label={translate('Script for creation of a resource')}
        required={true}
      />
      <TextField
        name="delete"
        label={translate('Script for termination of a resource')}
        required={true}
      />
      <TextField
        name="update"
        label={translate('Script for updating a resource on plan change')}
        required={true}
      />
      <TextField
        name="pull"
        label={translate('Script for regular update of resource and its accounting')}
        required={true}
      />
    </FormContainer>
    <FieldArray name="environ" component={EnvironmentVariablesList}/>
  </>
);
