import * as React from 'react';
import { useSelector } from 'react-redux';
import { FieldArray } from 'redux-form';

import { FormContainer, SelectField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { getForm } from '@waldur/marketplace/offerings/store/selectors';

import { EnvironmentVariablesList } from './EnvironmentVariablesList';

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python 3.7',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'shell',
  },
];

const getLanguage = (state) =>
  (getForm(state, 'secret_options') || {}).language;

export const ScriptsForm = ({ container }) => {
  const language = useSelector(getLanguage);
  return (
    <>
      <FormContainer {...container}>
        <SelectField
          name="language"
          label={translate('Script language')}
          options={PROGRAMMING_LANGUAGE_CHOICES}
          simpleValue={true}
          required={true}
          isClearable={false}
        />
        <MonacoField
          name="create"
          label={translate('Script for creation of a resource')}
          required={true}
          mode={language}
        />
        <MonacoField
          name="delete"
          label={translate('Script for termination of a resource')}
          required={true}
          mode={language}
        />
        <MonacoField
          name="update"
          label={translate('Script for updating a resource on plan change')}
          required={true}
          mode={language}
        />
        <MonacoField
          name="pull"
          label={translate(
            'Script for regular update of resource and its accounting',
          )}
          required={true}
          mode={language}
        />
      </FormContainer>
      <FieldArray name="environ" component={EnvironmentVariablesList} />
    </>
  );
};
