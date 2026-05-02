import { useQuery } from '@tanstack/react-query';
import { Form } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import {
  type OpenStackServerGroupRequest,
  openstackServerGroupsList,
  openstackTenantsCreateServerGroup,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { getLatinNameValidators, required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

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

const SERVER_GROUP_FORM_NAME = 'CreateServerGroupForm';

export const CreateServerGroupDialog = reduxForm<
  OpenStackServerGroupRequest,
  CreateServerGroupDialogProps
>({
  form: SERVER_GROUP_FORM_NAME,
})(({ handleSubmit, submitting, invalid, resolve: { resource, refetch } }) => {
  const {
    data: serverGroups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['openstack-server-groups', resource.url],
    queryFn: () =>
      getAllPages((page) =>
        openstackServerGroupsList({
          query: {
            page,
            tenant: resource.url,
            field: ['name', 'url'],
          },
        }),
      ),
  });

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

  return (
    <form
      onSubmit={handleSubmit((values) => submitMutation.mutateAsync(values))}
    >
      <AsyncActionDialog
        title={translate('Create server group for OpenStack tenant {name}', {
          name: resource.name,
        })}
        loading={isLoading}
        error={error}
        submitting={submitting}
        invalid={invalid}
      >
        {serverGroups ? (
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
  );
});
