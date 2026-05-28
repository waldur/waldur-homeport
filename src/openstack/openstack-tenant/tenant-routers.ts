import {
  openstackRoutersSetErred,
  openstackRoutersSetOk,
} from 'waldur-js-client';

import { createSetErredAction } from '@/resource/actions/SetResourceErredAction';
import { createSetOkAction } from '@/resource/actions/SetResourceOkAction';
import { ActionConfiguration } from '@/resource/actions/types';

import { AddRouterInterfaceButton } from './AddRouterInterfaceButton';
import { RemoveExternalGatewayButton } from './RemoveExternalGatewayButton';
import { RemoveRouterButton } from './RemoveRouterButton';
import { RemoveRouterInterfaceButton } from './RemoveRouterInterfaceButton';
import { SetExternalGatewayButton } from './SetExternalGatewayButton';
import { SetRoutersButton } from './SetRoutersButton';

export const OpenStackRouterActions: ActionConfiguration = {
  type: 'OpenStack.Router',
  actions: [
    SetRoutersButton,
    SetExternalGatewayButton,
    RemoveExternalGatewayButton,
    AddRouterInterfaceButton,
    RemoveRouterInterfaceButton,
    RemoveRouterButton,
    createSetErredAction(openstackRoutersSetErred),
    createSetOkAction(openstackRoutersSetOk),
  ],
};
