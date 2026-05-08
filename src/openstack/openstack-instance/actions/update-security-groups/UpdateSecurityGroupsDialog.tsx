import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  OpenStackInstance,
  openstackInstancesUpdateSecurityGroups,
  openstackPortsUpdateSecurityGroups,
} from 'waldur-js-client';

import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSecurityGroups } from '@/openstack/api';
import { OPENSTACK_PORT_TYPE } from '@/openstack/constants';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

interface FormData {
  security_groups: Option[];
}

interface UpdateSecurityGroupsDialogProps {
  resolve: {
    resource: OpenStackInstance;
    refetch?(): void;
  };
}

export const UpdateSecurityGroupsDialog: FC<
  UpdateSecurityGroupsDialogProps
> = ({ resolve: { resource, refetch } }) => {
  const {
    data: securityGroupOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['UpdateSecurityGroupsDialog', resource.service_settings_uuid],
    queryFn: () =>
      loadSecurityGroups({
        tenant_uuid: resource.tenant_uuid,
        field: ['name', 'url'],
      }).then((groups) =>
        groups.map((group) => ({
          label: group.name,
          value: group.url,
        })),
      ),
  });

  const resourceLabel =
    resource.resource_type === OPENSTACK_PORT_TYPE
      ? translate('OpenStack port')
      : translate('OpenStack instance');

  const { mutateAsync } = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) => {
      const api =
        resource.resource_type === OPENSTACK_PORT_TYPE
          ? openstackPortsUpdateSecurityGroups
          : openstackInstancesUpdateSecurityGroups;
      return api({
        path: { uuid: resource.uuid },
        body: {
          security_groups: (formData.security_groups || []).map(
            (item) => item.value,
          ),
        },
      });
    },
    successMessage: translate(
      'Update of {resource} security groups has been scheduled.',
      { resource: resourceLabel },
    ),
    errorMessage: translate('Unable to update security groups of {resource}.', {
      resource: resourceLabel,
    }),
    refetch,
  });

  const initialValues = useMemo<FormData>(
    () => ({
      security_groups: (resource as OpenStackInstance).security_groups.map(
        (group) => ({
          label: group.name,
          value: group.url,
        }),
      ),
    }),
    [],
  );

  return (
    <Form<FormData>
      onSubmit={mutateAsync}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Update security groups for {resource} {name}', {
              resource: resourceLabel,
              name: resource.name,
            })}
            loading={isLoading}
            error={error}
            submitting={submitting}
            invalid={invalid}
          >
            {securityGroupOptions ? (
              <BootstrapForm.Group>
                <BootstrapForm.Label>
                  {translate('Security groups')}
                </BootstrapForm.Label>
                <Field
                  component={SelectField}
                  name="security_groups"
                  placeholder={translate('Select security groups...')}
                  options={securityGroupOptions}
                  isMulti={true}
                />
              </BootstrapForm.Group>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
