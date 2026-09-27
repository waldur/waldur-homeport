import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'system-logging',
    title: translate('System logging'),
    component: lazyComponent(() =>
      import('../system-logging/AdministrationSystemLogging').then(
        (module) => ({
          default: module.AdministrationSystemLogging,
        }),
      ),
    ),
  },
  {
    key: 'telemetry',
    title: translate('Telemetry'),
    component: lazyComponent(() =>
      import('../telemetry/AdministrationTelemetry').then((module) => ({
        default: module.AdministrationTelemetry,
      })),
    ),
  },
];

export const LoggingTelemetryPage = () => (
  <TableWithTabs
    title={translate('Logging & telemetry')}
    subtitle={translate('System log collection and telemetry reporting.')}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
