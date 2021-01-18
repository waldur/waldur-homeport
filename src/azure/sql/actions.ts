import { ActionRegistry } from '@waldur/resource/actions/registry';

import { DestroyServerAction } from './DestroyServerAction';

ActionRegistry.register('Azure.SQLServer', [DestroyServerAction]);
