import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { FormGroup, FormLabel } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useAsync } from 'react-use';
import { OpenStackBackup, openstackBackupsRestore } from 'waldur-js-client';

import { required } from '@/core/validators';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { NetworksList } from './NetworksList';
import {
  BackupRestoreFormData,
  getInitialValues,
  loadData,
  serializeBackupRestoreFormData,
} from './utils';

export const BackupRestoreDialog: FC<{
  resolve: { resource: OpenStackBackup; refetch?(): void };
}> = ({ resolve: { resource, refetch } }) => {
  const asyncState = useAsync(() => loadData(resource), [resource]);

  const mutation = useManagedMutation<any, any, BackupRestoreFormData>({
    mutationFn: (formData) =>
      openstackBackupsRestore({
        path: { uuid: resource.uuid },
        body: serializeBackupRestoreFormData(formData),
      }),
    successMessage: translate('VM snapshot restoration has been scheduled.'),
    errorMessage: translate('Unable to restore VM snapshot.'),
    refetch,
  });

  const submitRequest = async (formData: BackupRestoreFormData) => {
    try {
      await mutation.mutateAsync(formData);
    } catch {
      // Error is handled by useManagedMutation
    }
  };

  return (
    <Form
      mutators={{
        ...arrayMutators,
      }}
      onSubmit={submitRequest}
      initialValues={getInitialValues(resource)}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
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
                <FormGroup className="mb-5">
                  <FormLabel id="flavor">{translate('Flavor')}</FormLabel>
                  <Field
                    name="flavor"
                    validate={required}
                    render={({ input }) => (
                      <Select
                        {...input}
                        options={asyncState.value.flavors}
                        aria-labelledby="flavor"
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup className="mb-5">
                  <FormLabel id="security-groups">
                    {translate('Security groups')}
                  </FormLabel>
                  <Field
                    name="security_groups"
                    render={({ input }) => (
                      <Select
                        {...input}
                        placeholder={translate('Select security groups...')}
                        isMulti={true}
                        options={asyncState.value.securityGroups}
                        aria-labelledby="security-groups"
                      />
                    )}
                  />
                </FormGroup>
                <FormGroup className="mb-5">
                  <FormLabel>{translate('Networks')}</FormLabel>
                  <FieldArray
                    name="networks"
                    component={NetworksList as any}
                    subnets={asyncState.value.subnets}
                    floatingIps={asyncState.value.floatingIps}
                    values={values}
                  />
                </FormGroup>
              </>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
