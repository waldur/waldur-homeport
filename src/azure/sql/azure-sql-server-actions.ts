import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import CreateDatabaseAction from './CreateDatabaseAction';
import DestroyServerAction from './DestroyServerAction';

ActionConfigurationRegistry.register('Azure.SQLServer', [
  CreateDatabaseAction,
  DestroyServerAction,
]);
