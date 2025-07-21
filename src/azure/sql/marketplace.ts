import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

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
  type: 'Azure.SQLServer',
  get label() {
    return translate('Azure PostgreSQL database server');
  },
  orderFormComponent: AzureSQLServerForm,
  detailsComponent: AzureCredentials,
  credentialsForm: AzureCredentialsForm,
};
