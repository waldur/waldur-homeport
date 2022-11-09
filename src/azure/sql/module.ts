import { lazyComponent } from '@waldur/core/lazyComponent';
import './marketplace';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './tabs';

const AzureSQLDatabaseSummary = lazyComponent(
  () => import('./AzureSQLDatabaseSummary'),
  'AzureSQLDatabaseSummary',
);
const AzureSQLServerSummary = lazyComponent(
  () => import('./AzureSQLServerSummary'),
  'AzureSQLServerSummary',
);

ResourceSummary.register('Azure.SQLServer', AzureSQLServerSummary);
ResourceSummary.register('Azure.SQLDatabase', AzureSQLDatabaseSummary);
