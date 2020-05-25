import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';
import store from '@waldur/store/store';

import { RancherClusterKubeconfigDialog } from './RancherClusterKubeconfigDialog';

export function kubeconfigAction(ctx: ActionContext): ResourceAction {
  return {
    name: 'kubeconfig',
    title: translate('Generate Kubeconfig file'),
    type: 'callback',
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
