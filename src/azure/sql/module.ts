import './marketplace';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './azure-sql-server-actions';
import './tabs';
import { AzureSQLDatabaseSummary } from './AzureSQLDatabaseSummary';
import { AzureSQLServerSummary } from './AzureSQLServerSummary';

ResourceSummary.register('Azure.SQLServer', AzureSQLServerSummary);
ResourceSummary.register('Azure.SQLDatabase', AzureSQLDatabaseSummary);
