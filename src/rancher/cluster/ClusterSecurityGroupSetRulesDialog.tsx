import { useDispatch } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';
import { rancherClusterSecurityGroupsUpdate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { RulesList } from '@waldur/openstack/openstack-security-groups/rule-editor/RulesList';
import { SecurityGroupRulesFormData } from '@waldur/openstack/openstack-security-groups/rule-editor/types';
import { serializeRulesPayload } from '@waldur/openstack/openstack-security-groups/rule-editor/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ClusterSecurityGroupSetRulesDialog = reduxForm<{}, { resolve }>({
  form: 'ClusterSecurityGroupSetRulesDialog',
})(({ handleSubmit, submitting, invalid, resolve }) => {
  const dispatch = useDispatch();

  const submitRequest = async (formData: SecurityGroupRulesFormData) => {
    try {
      await rancherClusterSecurityGroupsUpdate({
        path: { uuid: resolve.resource.uuid },
        body: { rules: serializeRulesPayload(formData) },
      });
      await resolve.refetch();
      dispatch(showSuccess(translate('Rules have been updated.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to update rules.')));
    }
  };

  return (
    <ActionDialog
      title={translate('Set rules in {name} security group', {
        name: resolve.resource.name,
      })}
      submitting={submitting}
      invalid={invalid}
      onSubmit={handleSubmit(submitRequest)}
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
