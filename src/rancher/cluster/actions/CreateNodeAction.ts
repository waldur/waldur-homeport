import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';

export function createNodeAction(ctx: ActionContext): ResourceAction {
  return {
    name: 'create_node',
    title: translate('Create node'),
    iconClass: 'fa fa-plus',
    type: 'callback',
    tab: 'nodes',
    execute: () => {
      $uibModal.open({
        component: 'rancherCreateNodeDialog',
        resolve: {
          cluster: ctx.resource,
        },
      });
    },
  };
}
