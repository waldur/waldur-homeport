import { Badge, Card, CardContent } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import {
  BILLING_SYNC_STATES,
  useArrowConsumptionStatus,
  useArrowSettings,
  useBillingSyncStateCounts,
} from '../api';
import { getBillingSyncStateLabel } from '../constants';

export const BillingSyncStatusCard = () => {
  const { data: settings, isLoading: settingsLoading } = useArrowSettings();
  const { data: status, isLoading: statusLoading } =
    useArrowConsumptionStatus();
  const { data: counts } = useBillingSyncStateCounts(settings?.uuid);

  if (settingsLoading || statusLoading) {
    return (
      <Card>
        <CardContent className="text-center py-5">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-5 gap-y-3">
          <div>
            <div className="text-quaternary small mb-1">
              {translate('Billing sync')}
            </div>
            <Badge
              variant={settings.sync_enabled ? 'success' : 'warning'}
              shape="pill"
              tone="outline"
            >
              {settings.sync_enabled
                ? translate('Enabled')
                : translate('Paused')}
            </Badge>
          </div>
          <div>
            <div className="text-quaternary small mb-1">
              {translate('Consumption sync')}
            </div>
            {/* Consumption sync needs both the deployment-wide switch and
                these settings; the switch does not gate the billing sync. */}
            {!status ? (
              renderFieldOrDash(null)
            ) : (
              <Badge
                variant={
                  status.global_sync_enabled && settings.sync_enabled
                    ? 'success'
                    : 'warning'
                }
                shape="pill"
                tone="outline"
              >
                {!status.global_sync_enabled
                  ? translate('Disabled globally')
                  : settings.sync_enabled
                    ? translate('Enabled')
                    : translate('Paused')}
              </Badge>
            )}
          </div>
          {BILLING_SYNC_STATES.map((state) => (
            <div key={state}>
              <div className="text-quaternary small mb-1">
                {getBillingSyncStateLabel(state)}
              </div>
              <span className="font-medium">
                {renderFieldOrDash(counts?.[state])}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
