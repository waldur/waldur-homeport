import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';

export function kubeconfigAction(ctx: ActionContext): ResourceAction {
  return {
    name: 'kubeconfig',
    title: translate('Generate Kubeconfig file'),
    type: 'callback',
    execute: () => {
      $uibModal.open({
        component: 'rancherClusterKubeconfigDialog',
        resolve: {
          resource: ctx.resource,
        },
      });
    },
  };
}
