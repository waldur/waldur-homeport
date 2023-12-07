import { Form } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { getLatinNameValidators } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { RulesList } from '@waldur/openstack/openstack-security-groups/rule-editor/RulesList';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { connectForm } from './utils';

export const CreateSecurityGroupForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resource,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <AsyncActionDialog
        title={translate('Create security group for OpenStack tenant {name}', {
          name: resource.name,
        })}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value ? (
          <>
            <Form.Group>
              <Form.Label>{translate('Name')}</Form.Label>
              <Field
                component={InputField}
                name="name"
                validate={getLatinNameValidators()}
                maxLength={150}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>{translate('Description')}</Form.Label>
              <Field
                component={InputField}
                name="description"
                maxLength={2000}
              />
            </Form.Group>

            <FieldArray
              name="rules"
              component={RulesList}
              remoteSecurityGroups={asyncState.value}
            />
          </>
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);
