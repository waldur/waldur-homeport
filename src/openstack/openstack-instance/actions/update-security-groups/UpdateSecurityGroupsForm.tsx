import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { connectForm } from './utils';

export const UpdateSecurityGroupsForm = connectForm(
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
        title={translate(
          'Update security groups for OpenStack instance {name}',
          {
            name: resource.name,
          },
        )}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value ? (
          <Form.Group>
            <Form.Label>{translate('Security groups')}</Form.Label>
            <Field
              component={SelectField}
              name="security_groups"
              placeholder={translate('Select security groups...')}
              options={asyncState.value}
              isMulti={true}
            />
          </Form.Group>
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);
