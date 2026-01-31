import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { TableWithTabs } from '@waldur/table/TableWithTabs';

import { useArrowSettings } from './api';
import { ARROW_TAB_KEYS } from './constants';

const tabs = [
  {
    key: ARROW_TAB_KEYS.overview,
    title: translate('Overview'),
    component: lazyComponent(() =>
      import('./settings/ArrowSettingsCard').then((module) => ({
        default: module.ArrowSettingsCard,
      })),
    ),
  },
  {
    key: ARROW_TAB_KEYS.mappings,
    title: translate('Customer Mappings'),
    component: lazyComponent(() =>
      import('./mappings/CustomerMappingsList').then((module) => ({
        default: module.CustomerMappingsList,
      })),
    ),
  },
  {
    key: ARROW_TAB_KEYS.vendorOfferings,
    title: translate('Vendor Offerings'),
    component: lazyComponent(() =>
      import('./vendorOfferings/VendorOfferingMappingsList').then((module) => ({
        default: module.VendorOfferingMappingsList,
      })),
    ),
  },
  {
    key: ARROW_TAB_KEYS.billing,
    title: translate('Billing Sync'),
    component: lazyComponent(() =>
      import('./billing/BillingSyncList').then((module) => ({
        default: module.BillingSyncList,
      })),
    ),
  },
  {
    key: ARROW_TAB_KEYS.consumption,
    title: translate('Consumption Records'),
    component: lazyComponent(() =>
      import('./consumption/ConsumptionRecordsList').then((module) => ({
        default: module.ConsumptionRecordsList,
      })),
    ),
  },
  {
    key: ARROW_TAB_KEYS.resources,
    title: translate('Resources'),
    component: lazyComponent(() =>
      import('./resources/ArrowResourcesList').then((module) => ({
        default: module.ArrowResourcesList,
      })),
    ),
  },
  {
    key: ARROW_TAB_KEYS.debug,
    title: translate('Debug'),
    component: lazyComponent(() =>
      import('./debug/ArrowDebugPanel').then((module) => ({
        default: module.ArrowDebugPanel,
      })),
    ),
  },
];

export const ArrowDashboard = () => {
  const { data: settings } = useArrowSettings();

  return (
    <TableWithTabs
      title={translate('Arrow Integration')}
      subtitle={translate(
        'Manage Arrow (ArrowSphere) cloud distribution platform integration for billing synchronization.',
      )}
      tabs={tabs}
      data={{ settings }}
      syncWithUrlKey="tab"
    />
  );
};
