import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext } from '@waldur/resource/actions/types';

const RancherClusterKubeconfigDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterKubeconfigDialog" */ './RancherClusterKubeconfigDialog'
    ),
  'RancherClusterKubeconfigDialog',
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state !== 'OK') {
    return translate('Instance should be OK. Please contact support.');
  }
}

const validators = [validate];

export const KubeconfigFileAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Generate Kubeconfig file')}
    modalComponent={RancherClusterKubeconfigDialog}
    resource={resource}
    validators={validators}
  />
);
