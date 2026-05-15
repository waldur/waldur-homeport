import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { rancherClusterSecurityGroupsUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RulesList } from '@/openstack/openstack-security-groups/rule-editor/RulesList';
import { SecurityGroupRulesFormData } from '@/openstack/openstack-security-groups/rule-editor/types';
import { serializeRulesPayload } from '@/openstack/openstack-security-groups/rule-editor/utils';

interface ClusterSecurityGroupSetRulesDialogProps {
  resolve: {
    resource: any;
    refetch?: () => void;
  };
}

export const ClusterSecurityGroupSetRulesDialog: FC<
  ClusterSecurityGroupSetRulesDialogProps
> = ({ resolve: { resource, refetch } }) => {
  const { mutateAsync, isPending } = useManagedMutation<
    any,
    any,
    SecurityGroupRulesFormData
  >({
    mutationFn: (formData) =>
      rancherClusterSecurityGroupsUpdate({
        path: { uuid: resource.uuid },
        body: { rules: serializeRulesPayload(formData) },
      }),
    successMessage: translate('Rules have been updated.'),
    errorMessage: translate('Unable to update rules.'),
    refetch,
  });

  const initialValues = useMemo(
    () => ({
      rules: (resource.rules || []).map(({ from_port, to_port, ...rest }) => ({
        ...rest,
        port_range: {
          min: from_port,
          max: to_port,
        },
      })),
    }),
    [resource.rules],
  );

  return (
    <FinalForm<SecurityGroupRulesFormData>
      onSubmit={mutateAsync}
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
      render={({ handleSubmit, invalid }) => (
        <ActionDialogFinal
          title={translate('Set rules in {name} security group', {
            name: resource.name,
          })}
          submitting={isPending}
          invalid={invalid}
          onSubmit={handleSubmit}
          submitLabel={translate('Set rules')}
        >
          <RulesList remoteSecurityGroups={[]} />
        </ActionDialogFinal>
      )}
    />
  );
};
