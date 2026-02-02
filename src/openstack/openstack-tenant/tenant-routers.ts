import {
  openstackRoutersSetErred,
  openstackRoutersSetOk,
} from 'waldur-js-client';

import { createSetErredAction } from '@waldur/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@waldur/resource/actions/SetResourceOkAction';
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
    createSetErredAction(openstackRoutersSetErred),
    createSetOkAction(openstackRoutersSetOk),
  ],
};
