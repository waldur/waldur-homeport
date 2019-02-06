import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { AzureSQLServerDetails } from './AzureSQLServerDetails';
import { AzureSQLServerForm } from './AzureSQLServerForm';

registerOfferingType({
  type: 'Azure.SQLServer',
  get label() {
    return translate('Azure PostgreSQL database server');
  },
  component: AzureSQLServerForm,
  detailsComponent: AzureSQLServerDetails,
  providerType: 'Azure',
});
