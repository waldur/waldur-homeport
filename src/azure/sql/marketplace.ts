import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

const AzureCredentials = lazyComponent(() =>
  import('../common/AzureCredentials').then((module) => ({
    default: module.AzureCredentials,
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
  providerType: 'Azure',
  allowToUpdateService: true,
};
