import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { getLatinNameValidators, required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { connectServerGroupForm } from './utils';

export const getPolicies = () => [
  { value: 'affinity', label: translate('Affinity') },
];

export const CreateServerGroupForm = connectServerGroupForm(
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
        title={translate('Create server group for OpenStack tenant {name}', {
          name: resource.name,
        })}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value ? (
          <>
            <Form.Label>{translate('Name')}</Form.Label>
            <Field
              component={InputField}
              name="name"
              validate={getLatinNameValidators()}
              maxLength={150}
            />

            <Form.Label>{translate('Policy')}</Form.Label>
            <Field
              name="policy"
              component={(fieldProps) => (
                <Select
                  placeholder={translate('Select policy...')}
                  options={getPolicies()}
                  value={fieldProps.input.value}
                  onChange={(value) => fieldProps.input.onChange(value)}
                  isClearable={true}
                  required={true}
                  validate={required}
                />
              )}
            />
          </>
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);
