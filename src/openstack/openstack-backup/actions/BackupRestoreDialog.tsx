import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { OpenStackBackup } from '../types';

import { NetworksList } from './NetworksList';
import { connectBackupRestoreForm, useBackupRestoreForm } from './utils';

const BackupRestoreForm = connectBackupRestoreForm(
  ({
    resource,
    asyncState,
    submitting,
    handleSubmit,
    submitRequest,
    invalid,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <AsyncActionDialog
        title={translate('Restore virtual machine from backup {name}', {
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
              <Form.Label>{translate('Flavor')}</Form.Label>
              <Field
                component={SelectField}
                name="flavor"
                validate={required}
                options={asyncState.value.flavors}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>{translate('Security groups')}</Form.Label>
              <Field
                component={SelectField}
                name="security_groups"
                placeholder={translate('Select security groups...')}
                isMulti={true}
                options={asyncState.value.securityGroups}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>{translate('Networks')}</Form.Label>
              <FieldArray
                name="networks"
                component={NetworksList}
                subnets={asyncState.value.subnets}
                floatingIps={asyncState.value.floatingIps}
              />
            </Form.Group>
          </>
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);

export const BackupRestoreDialog: FC<{
  resolve: { resource: OpenStackBackup };
}> = ({ resolve: { resource } }) => {
  const formProps = useBackupRestoreForm(resource);

  return <BackupRestoreForm {...formProps} />;
};
