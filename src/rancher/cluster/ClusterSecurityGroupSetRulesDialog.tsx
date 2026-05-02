import { FieldArray, reduxForm } from 'redux-form';
import { rancherClusterSecurityGroupsUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RulesList } from '@/openstack/openstack-security-groups/rule-editor/RulesList';
import { SecurityGroupRulesFormData } from '@/openstack/openstack-security-groups/rule-editor/types';
import { serializeRulesPayload } from '@/openstack/openstack-security-groups/rule-editor/utils';

export const ClusterSecurityGroupSetRulesDialog = reduxForm<{}, { resolve }>({
  form: 'ClusterSecurityGroupSetRulesDialog',
})(({ handleSubmit, invalid, resolve }) => {
  const { mutate, isPending } = useManagedMutation<
    any,
    any,
    SecurityGroupRulesFormData
  >({
    mutationFn: (formData) =>
      rancherClusterSecurityGroupsUpdate({
        path: { uuid: resolve.resource.uuid },
        body: { rules: serializeRulesPayload(formData) },
      }),
    successMessage: translate('Rules have been updated.'),
    errorMessage: translate('Unable to update rules.'),
    refetch: resolve.refetch,
  });

  return (
    <ActionDialog
      title={translate('Set rules in {name} security group', {
        name: resolve.resource.name,
      })}
      submitting={isPending}
      invalid={invalid}
      onSubmit={handleSubmit((values: SecurityGroupRulesFormData) =>
        mutate(values),
      )}
      submitLabel={translate('Set rules')}
    >
      <FieldArray
        name="rules"
        component={RulesList}
        remoteSecurityGroups={[]}
      />
    </ActionDialog>
  );
});
