import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

const AzureSQLServerDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AzureSQLServerDetails" */ './AzureSQLServerDetails'
    ),
  'AzureSQLServerDetails',
);
const AzureSQLServerForm = lazyComponent(
  () =>
    import(/* webpackChunkName: "AzureSQLServerForm" */ './AzureSQLServerForm'),
  'AzureSQLServerForm',
);

registerOfferingType({
  type: 'Azure.SQLServer',
  get label() {
    return translate('Azure PostgreSQL database server');
  },
  component: AzureSQLServerForm,
  detailsComponent: AzureSQLServerDetails,
  providerType: 'Azure',
});
