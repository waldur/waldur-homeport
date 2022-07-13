import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { FieldArray } from 'redux-form';

import { FormContainer, SelectField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import {
  getForm,
  getOffering,
} from '@waldur/marketplace/offerings/store/selectors';
import { RootState } from '@waldur/store/reducers';

import { EnvironmentVariablesList } from './EnvironmentVariablesList';
import { TestScriptButton } from './TestScriptButton';

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'shell',
  },
];

const getLanguage = (state: RootState) =>
  (getForm(state, 'secret_options') || {}).language;

const getScripts = (state: RootState) => {
  const {
    create,
    update,
    pull,
    delete: deleteScript,
  } = getForm(state, 'secret_options') || {};
  return { create, update, pull, delete: deleteScript };
};

export const ScriptsForm: FunctionComponent<{
  container;
  dryRunOfferingScript: Function;
}> = ({ container }) => {
  const language = useSelector(getLanguage);
  const scripts = useSelector(getScripts);
  const offering = useSelector(getOffering);

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
        {offering.isUpdatingOffering ? (
          <TestScriptButton
            container={container}
            type="Create"
            disabled={!scripts.create}
          />
        ) : null}
        <MonacoField
          name="delete"
          label={translate('Script for termination of a resource')}
          required={true}
          mode={language}
        />
        {offering.isUpdatingOffering ? (
          <TestScriptButton
            container={container}
            type="Terminate"
            disabled={!scripts.delete}
          />
        ) : null}
        <MonacoField
          name="update"
          label={translate('Script for updating a resource on plan change')}
          required={true}
          mode={language}
        />
        {offering.isUpdatingOffering ? (
          <TestScriptButton
            container={container}
            type="Update"
            disabled={!scripts.update}
          />
        ) : null}
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
