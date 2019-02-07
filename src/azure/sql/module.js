import './marketplace';
import { AzureSQLDatabaseSummary } from './AzureSQLDatabaseSummary';
import { AzureSQLServerSummary } from './AzureSQLServerSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import azureDatabasesService from './azure-sql-databases-service';
import azureDatabasesList from './azure-sql-databases-list';
import azureSQLServerTabs from './azure-sql-server-tabs';
import azureSQLServerActions from './azure-sql-server-actions';

export default module => {
  ResourceSummary.register('Azure.SQLServer', AzureSQLServerSummary);
  ResourceSummary.register('Azure.SQLDatabase', AzureSQLDatabaseSummary);
  module.service('azureSQLDatabasesService', azureDatabasesService);
  module.component('azureSQLDatabasesList', azureDatabasesList);
  module.config(azureSQLServerTabs);
  module.config(azureSQLServerActions);
};
