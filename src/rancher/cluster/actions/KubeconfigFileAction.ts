import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';
import store from '@waldur/store/store';

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

export function kubeconfigAction(ctx: ActionContext): ResourceAction {
  return {
    name: 'kubeconfig',
    title: translate('Generate Kubeconfig file'),
    type: 'callback',
    validators: [validate],
    execute: () => {
      store.dispatch(
        openModalDialog(RancherClusterKubeconfigDialog, {
          resolve: {
            resource: ctx.resource,
          },
        }),
      );
    },
  };
}
