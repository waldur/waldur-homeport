import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getLatinNameValidators } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RulesList } from '@waldur/openstack/openstack-security-groups/rule-editor/RulesList';

import { connectForm } from './utils';

export const CreateSecurityGroupForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resourceName,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Create security group for OpenStack tenant {name}', {
          name: resourceName,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={submitting}
              disabled={asyncState.loading || invalid}
              label={translate('Submit')}
            />
          </>
        }
      >
        {asyncState.loading ? (
          <LoadingSpinner />
        ) : asyncState.error ? (
          <>{translate('Unable to load data.')}</>
        ) : (
          <>
            <FormGroup>
              <ControlLabel>{translate('Name')}</ControlLabel>
              <Field
                component={InputField}
                name="name"
                validate={getLatinNameValidators()}
                maxLength={150}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{translate('Description')}</ControlLabel>
              <Field
                component={InputField}
                name="description"
                maxLength={2000}
              />
            </FormGroup>

            <FieldArray
              name="rules"
              component={RulesList}
              remoteSecurityGroups={asyncState.value}
            />
          </>
        )}
      </ModalDialog>
    </form>
  ),
);
