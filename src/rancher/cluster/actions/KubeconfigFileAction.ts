import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';
import store from '@waldur/store/store';

import { RancherClusterKubeconfigDialog } from './RancherClusterKubeconfigDialog';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (
    ctx.resource.state === 'Creating' ||
    ctx.resource.state === 'Creation Scheduled'
  ) {
    return translate(
      'Instance should not be Creating, or Creation Scheduled. Please contact support.',
    );
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
