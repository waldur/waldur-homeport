import CreateDatabaseAction from './CreateDatabaseAction';
import DestroyServerAction from './DestroyServerAction';

// @ngInject
export default function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Azure.SQLServer', [
    CreateDatabaseAction,
    DestroyServerAction,
  ]);
}
