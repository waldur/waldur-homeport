import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

const AzureSQLServerDetails = lazyComponent(
  () => import('./AzureSQLServerDetails'),
  'AzureSQLServerDetails',
);
const AzureSQLServerForm = lazyComponent(
  () => import('./AzureSQLServerForm'),
  'AzureSQLServerForm',
);

registerOfferingType({
  type: 'Azure.SQLServer',
  get label() {
    return translate('Azure PostgreSQL database server');
  },
  orderFormComponent: AzureSQLServerForm,
  detailsComponent: AzureSQLServerDetails,
  providerType: 'Azure',
  allowToUpdateService: true,
});
