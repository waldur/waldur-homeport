import './marketplace';
import { AzureSQLDatabaseSummary } from './AzureSQLDatabaseSummary';
import { AzureSQLServerSummary } from './AzureSQLServerSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default () => {
  ResourceSummary.register('Azure.SQLServer', AzureSQLServerSummary);
  ResourceSummary.register('Azure.SQLDatabase', AzureSQLDatabaseSummary);
};
