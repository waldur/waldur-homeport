import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  type OpenStackServerGroupRequest,
  openstackTenantsCreateServerGroup,
} from 'waldur-js-client';

import {
  composeValidators,
  getLatinNameValidators,
  required,
} from '@/core/validators';
import { StringGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OpenStackTenant } from '../types';

interface CreateServerGroupDialogProps {
  resolve: {
    resource: OpenStackTenant;
    refetch?;
  };
}

const getPolicies = () => [
  { value: 'affinity', label: translate('Affinity') },
  { value: 'anti-affinity', label: translate('Anti-affinity') },
  { value: 'soft-affinity', label: translate('Soft affinity') },
  { value: 'soft-anti-affinity', label: translate('Soft anti-affinity') },
];

export const CreateServerGroupDialog: FC<CreateServerGroupDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const submitMutation = useManagedMutation<
    any,
    any,
    OpenStackServerGroupRequest
  >({
    mutationFn: (formData) =>
      openstackTenantsCreateServerGroup({
        path: { uuid: resource.uuid },
        body: {
          ...formData,
          policy: formData.policy['value'],
        },
      }),
    successMessage: translate('Server group creation has been scheduled.'),
    errorMessage: translate('Unable to create server group.'),
    refetch,
  });

  const initialValues = useMemo(
    () => ({
      policy: getPolicies()[0],
    }),
    [],
  );

  return (
    <Form<OpenStackServerGroupRequest>
      onSubmit={async (values) => {
        try {
          await submitMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      initialValues={initialValues as any}
      render={({ handleSubmit, submitting, invalid }) => (
        <ActionDialogFinal
          onSubmit={handleSubmit}
          title={translate('Create server group for OpenStack tenant {name}', {
            name: resource.name,
          })}
          submitting={submitting}
          invalid={invalid}
        >
          <StringGroup
            label={translate('Name')}
            name="name"
            validate={composeValidators(...getLatinNameValidators())}
            maxLength={150}
            required={true}
          />

          <SelectGroup
            label={translate('Policy')}
            name="policy"
            placeholder={translate('Select policy...')}
            options={getPolicies()}
            isClearable={false}
            required={true}
            validate={required}
          />
        </ActionDialogFinal>
      )}
    />
  );
};
