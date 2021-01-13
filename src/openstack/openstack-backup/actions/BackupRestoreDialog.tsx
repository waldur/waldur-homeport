import { FC } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { OpenStackBackup } from '../types';

import { NetworksList } from './NetworksList';
import { connectBackupRestoreForm, useBackupRestoreForm } from './utils';

const BackupRestoreForm = connectBackupRestoreForm(
  ({
    resourceName,
    asyncState,
    submitting,
    handleSubmit,
    submitRequest,
    invalid,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Restore virtual machine from backup {name}', {
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
              <ControlLabel>{translate('Flavor')}</ControlLabel>
              <Field
                component={SelectField}
                name="flavor"
                validate={required}
                options={asyncState.value.flavors}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{translate('Security groups')}</ControlLabel>
              <Field
                component={SelectField}
                name="security_groups"
                placeholder={translate('Select security groups...')}
                isMulti={true}
                options={asyncState.value.securityGroups}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{translate('Networks')}</ControlLabel>
              <FieldArray
                name="networks"
                component={NetworksList}
                subnets={asyncState.value.subnets}
                floatingIps={asyncState.value.floatingIps}
              />
            </FormGroup>
          </>
        )}
      </ModalDialog>
    </form>
  ),
);

export const BackupRestoreDialog: FC<{
  resolve: { resource: OpenStackBackup };
}> = ({ resolve: { resource } }) => {
  const formProps = useBackupRestoreForm(resource);

  return <BackupRestoreForm {...formProps} />;
};
