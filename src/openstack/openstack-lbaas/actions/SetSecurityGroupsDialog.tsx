import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersSetSecurityGroups,
} from 'waldur-js-client';

import { FormGroup } from '@/form';
import { SelectField } from '@/form/select/SelectField';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSecurityGroups } from '@/openstack/api';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { LB_VIP_SECURITY_GROUPS_QUERY_KEY } from '../LoadBalancerExpandableRow';

interface FormData {
  security_groups: Option[];
}

const useSetSecurityGroupsForm = (
  resource: OpenStackLoadBalancer,
  refetch?: () => void,
) => {
  const asyncState = useQuery({
    queryKey: ['SetSecurityGroupsDialog', resource.tenant_uuid],

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

  const updateMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      openstackLoadbalancersSetSecurityGroups({
        path: { uuid: resource.uuid },
        body: {
          security_groups: (formData.security_groups || []).map(
            (item) => item.value,
          ),
        },
      }),
    successMessage: translate(
      'Update of load balancer security groups has been scheduled.',
    ),
    errorMessage: translate(
      'Unable to update security groups of load balancer.',
    ),
    refetch,
    invalidateQueries: [
      { queryKey: [LB_VIP_SECURITY_GROUPS_QUERY_KEY, resource.uuid] },
    ],
  });

  const submitRequest = (formData: FormData) =>
    updateMutation.mutateAsync(formData);

  const initialValues = useMemo<FormData>(
    () => ({
      security_groups: (resource.vip_security_groups || []).map((g: any) => ({
        label: g.name,
        value: g.url,
      })),
    }),
    [resource.vip_security_groups],
  );

  return { resource, asyncState, submitRequest, initialValues };
};

export const SetSecurityGroupsDialog: FC<
  ActionDialogProps<OpenStackLoadBalancer>
> = ({ resolve: { resource, refetch } }) => {
  const {
    resource: lb,
    asyncState,
    submitRequest,
    initialValues,
  } = useSetSecurityGroupsForm(resource, refetch);

  return (
    <Form<FormData>
      onSubmit={submitRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Set security groups for load balancer {name}', {
              name: lb.name,
            })}
            loading={asyncState.isLoading}
            error={asyncState.error}
            submitting={submitting}
            invalid={invalid}
          >
            {asyncState.data ? (
              <Field
                component={FormGroup}
                name="security_groups"
                label={translate('Security groups')}
              >
                <SelectField
                  placeholder={translate('Select security groups...')}
                  options={asyncState.data}
                  isMulti={true}
                />
              </Field>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
