import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';
import store from '@waldur/store/store';

import { CreateNodeDialog } from '../create/CreateNodeDialog';

export function createNodeAction(ctx: ActionContext): ResourceAction {
  return {
    name: 'create_node',
    title: translate('Create node'),
    iconClass: 'fa fa-plus',
    type: 'callback',
    tab: 'nodes',
    isVisible: !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE,
    execute: () => {
      store.dispatch(
        openModalDialog(CreateNodeDialog, {
          resolve: {
            cluster: ctx.resource,
          },
        }),
      );
    },
  };
}
