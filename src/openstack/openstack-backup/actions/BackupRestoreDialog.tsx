import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { FormGroup, FormLabel } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { OpenStackBackup, openstackBackupsRestore } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
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
  const asyncState = useQuery({
    queryKey: ['BackupRestoreDialog', resource],
    queryFn: () => loadData(resource),
  });

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
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Restore virtual machine from backup {name}', {
              name: resource.name,
            })}
            loading={asyncState.isLoading}
            error={asyncState.error}
          >
            {asyncState.data ? (
              <>
                <SelectGroup
                  label={translate('Flavor')}
                  name="flavor"
                  validate={required}
                  options={asyncState.data.flavors}
                  placeholder={translate('Select flavor...')}
                />
                <SelectGroup
                  label={translate('Security groups')}
                  name="security_groups"
                  placeholder={translate('Select security groups...')}
                  isMulti={true}
                  options={asyncState.data.securityGroups}
                />
                <FormGroup className="mb-5">
                  <FormLabel>{translate('Networks')}</FormLabel>
                  <FieldArray name="networks">
                    {({ fields }) => (
                      <NetworksList
                        fields={fields}
                        subnets={asyncState.data.subnets}
                        floatingIps={asyncState.data.floatingIps}
                        values={values}
                      />
                    )}
                  </FieldArray>
                </FormGroup>
              </>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
