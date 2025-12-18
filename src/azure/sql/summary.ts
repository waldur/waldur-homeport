import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

import { AZURE_SQL_TYPE } from '../constants';

const AzureSQLDatabaseSummary = lazyComponent(() =>
  import('./AzureSQLDatabaseSummary').then((module) => ({
    default: module.AzureSQLDatabaseSummary,
  })),
);
const AzureSQLServerSummary = lazyComponent(() =>
  import('./AzureSQLServerSummary').then((module) => ({
    default: module.AzureSQLServerSummary,
  })),
);

export const AzureSQLServerSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: AZURE_SQL_TYPE,
    component: AzureSQLServerSummary,
  };

export const AzureSQLDatabaseSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'Azure.SQLDatabase',
    component: AzureSQLDatabaseSummary,
  };
