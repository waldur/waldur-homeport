import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { AZURE_SQL_TYPE } from '../constants';

const AzureCredentialsForm = lazyComponent(() =>
  import('../common/AzureCredentialsForm').then((module) => ({
    default: module.AzureCredentialsForm,
  })),
);
const AzureCredentials = lazyComponent(() =>
  import('../common/AzureDetailsComponent').then((module) => ({
    default: module.AzureDetailsComponent,
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
  credentialsForm: AzureCredentialsForm,
};
