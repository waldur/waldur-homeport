import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { AZURE_SQL_TYPE } from '../constants';

const AzureCredentials = lazyComponent(() =>
  import('../common/AzureDetailsComponent').then((module) => ({
    default: module.AzureDetailsComponent,
  })),
);
const AzureCredentialsSection = lazyComponent(() =>
  import('../common/AzureCredentialsSection').then((module) => ({
    default: module.AzureCredentialsSection,
  })),
);
const AzureSQLServerForm = lazyComponent(() =>
  import('./AzureSQLServerForm').then((module) => ({
    default: module.AzureSQLServerForm,
  })),
);

export const AzureSQLServerOffering: OfferingConfiguration = {
  type: AZURE_SQL_TYPE,
  get label() {
    return translate('Azure PostgreSQL database server');
  },
  orderFormComponent: AzureSQLServerForm,
  detailsComponent: AzureCredentials,
  credentialsSection: AzureCredentialsSection,
};
