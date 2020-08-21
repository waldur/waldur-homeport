import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Cluster } from '@waldur/rancher/types';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';
import store from '@waldur/store/store';

import { CreateNodeDialog } from '../create/CreateNodeDialog';

export function createNodeAction(ctx: ActionContext<Cluster>): ResourceAction {
  return {
    name: 'create_node',
    title: translate('Create node'),
    iconClass: 'fa fa-plus',
    type: 'callback',
    tab: 'nodes',
    isVisible:
      !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE &&
      Boolean(ctx.resource.tenant_settings),
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
