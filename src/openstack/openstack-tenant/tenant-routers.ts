import { ActionConfiguration } from '@waldur/resource/actions/types';

import { AddRouterInterfaceButton } from './AddRouterInterfaceButton';
import { RemoveRouterButton } from './RemoveRouterButton';
import { RemoveRouterInterfaceButton } from './RemoveRouterInterfaceButton';
import { SetRoutersButton } from './SetRoutersButton';

export const OpenStackRouterActions: ActionConfiguration = {
  type: 'OpenStack.Router',
  actions: [
    SetRoutersButton,
    AddRouterInterfaceButton,
    RemoveRouterInterfaceButton,
    RemoveRouterButton,
  ],
};
