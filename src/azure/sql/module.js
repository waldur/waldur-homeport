import './marketplace';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import azureSQLServerActions from './azure-sql-server-actions';
import './tabs';
import { AzureSQLDatabaseSummary } from './AzureSQLDatabaseSummary';
import { AzureSQLServerSummary } from './AzureSQLServerSummary';

export default module => {
  ResourceSummary.register('Azure.SQLServer', AzureSQLServerSummary);
  ResourceSummary.register('Azure.SQLDatabase', AzureSQLDatabaseSummary);
  module.config(azureSQLServerActions);
};
