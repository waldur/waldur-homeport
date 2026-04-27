import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { OPENSTACK_PORT_TYPE } from '@/openstack/constants';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

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
        title={translate('Update security groups for {resource} {name}', {
          resource:
            resource.resource_type === OPENSTACK_PORT_TYPE
              ? translate('OpenStack port')
              : translate('OpenStack instance'),
          name: resource.name,
        })}
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
