import { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { Field, reduxForm } from 'redux-form';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersSetSecurityGroups,
} from 'waldur-js-client';

import { SelectField } from '@/form';
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

const FORM_NAME = 'SetLoadBalancerSecurityGroups';

const useSetSecurityGroupsForm = (
  resource: OpenStackLoadBalancer,
  refetch?: () => void,
) => {
  const asyncState = useAsync(
    () =>
      loadSecurityGroups({
        tenant_uuid: resource.tenant_uuid,
        field: ['name', 'url'],
      }).then((groups) =>
        groups.map((group) => ({
          label: group.name,
          value: group.url,
        })),
      ),
    [resource.tenant_uuid],
  );

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
    [],
  );

  return { resource, asyncState, submitRequest, initialValues };
};

type OwnProps = ReturnType<typeof useSetSecurityGroupsForm>;

const SetSecurityGroupsForm = reduxForm<FormData, OwnProps>({
  form: FORM_NAME,
})(
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
        title={translate('Set security groups for load balancer {name}', {
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

export const SetSecurityGroupsDialog: FC<
  ActionDialogProps<OpenStackLoadBalancer>
> = ({ resolve: { resource, refetch } }) => {
  const formState = useSetSecurityGroupsForm(resource, refetch);
  return <SetSecurityGroupsForm {...formState} />;
};
