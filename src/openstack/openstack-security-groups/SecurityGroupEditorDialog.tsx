import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import {
  OpenStackSecurityGroup,
  openstackSecurityGroupsList,
  openstackSecurityGroupsSetRules,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { RulesList } from './rule-editor/RulesList';
import { SecurityGroupRulesFormData } from './rule-editor/types';
import { serializeRulesPayload } from './rule-editor/utils';

interface SecurityGroupEditorDialogProps {
  resolve: {
    resource: OpenStackSecurityGroup;
    refetch?: () => void;
  };
}

export const SecurityGroupEditorDialog: FC<SecurityGroupEditorDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const tenant =
    resource.resource_type === 'OpenStack.Tenant'
      ? resource.url
      : resource.tenant;

  const {
    data: securityGroups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['openstack-security-groups', tenant],
    queryFn: () =>
      getAllPages((page) =>
        openstackSecurityGroupsList({
          query: { page, tenant, field: ['name', 'url'] },
        }),
      ),
    enabled: Boolean(tenant),
  });

  const { mutateAsync } = useManagedMutation<
    any,
    any,
    SecurityGroupRulesFormData
  >({
    mutationFn: (formData) =>
      openstackSecurityGroupsSetRules({
        path: { uuid: resource.uuid },
        body: serializeRulesPayload(formData),
      }),
    successMessage: translate(
      'Security group rules update has been scheduled.',
    ),
    errorMessage: translate('Unable to update security group rules.'),
    refetch,
  });

  const initialValues = useMemo(
    () => ({
      rules: resource.rules.map(
        ({ from_port, to_port, ethertype, direction, protocol, ...rest }) => ({
          ...rest,
          ethertype: ethertype,
          direction: direction,
          protocol: protocol || 'any',
          port_range: {
            min: from_port,
            max: to_port,
          },
        }),
      ),
    }),
    [resource.rules],
  );

  return (
    <FinalForm<SecurityGroupRulesFormData>
      onSubmit={mutateAsync}
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Set rules in {name} security group', {
              name: resource.name,
            })}
            loading={isLoading}
            error={error}
            submitting={submitting}
            invalid={invalid}
          >
            {securityGroups ? (
              <RulesList remoteSecurityGroups={securityGroups} />
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
