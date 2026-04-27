import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { getLatinNameValidators, required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { connectServerGroupForm } from './utils';

const getPolicies = () => [
  { value: 'affinity', label: translate('Affinity') },
  { value: 'anti-affinity', label: translate('Anti-affinity') },
  { value: 'soft-affinity', label: translate('Soft affinity') },
  { value: 'soft-anti-affinity', label: translate('Soft anti-affinity') },
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
