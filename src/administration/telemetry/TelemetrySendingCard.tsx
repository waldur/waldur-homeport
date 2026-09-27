import { useState } from 'react';
import { featureValues } from 'waldur-js-client';

import { TelemetryExampleButton } from '@/administration/TelemetryExampleButton';
import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { DeploymentFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

export const TelemetrySendingCard = () => {
  const { showErrorResponse, showSuccess } = useNotify();
  const [enabled, setEnabled] = useState(() =>
    isFeatureVisible(DeploymentFeatures.send_metrics),
  );
  const [submitting, setSubmitting] = useState(false);

  const toggle = async (value: boolean) => {
    setSubmitting(true);
    try {
      await featureValues({ body: { deployment: { send_metrics: value } } });
      ENV.FEATURES = {
        ...ENV.FEATURES,
        deployment: { ...ENV.FEATURES?.deployment, send_metrics: value },
      };
      setEnabled(value);
      showSuccess(
        value
          ? translate('Telemetry sending has been enabled.')
          : translate('Telemetry sending has been disabled.'),
      );
    } catch (e) {
      showErrorResponse(e, translate('Unable to update telemetry sending.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormTable.Card title={translate('Sending')} className="card-bordered mb-5">
      <FormTable>
        <FormTable.Item
          label={translate('Send telemetry metrics')}
          description={translate(
            'Send an anonymous daily usage report to the Waldur team.',
          )}
          tooltip={translate(
            'Operators can force this off at deploy time with WALDUR_TELEMETRY_ENABLED=false, which overrides this setting.',
          )}
          descriptionClassName="text-gray-600"
          value={<TelemetryExampleButton />}
          actions={
            <AwesomeCheckbox
              id="telemetry-send-metrics"
              value={enabled}
              onChange={toggle}
              disabled={submitting}
              data-testid={DeploymentFeatures.send_metrics}
            />
          }
        />
      </FormTable>
    </FormTable.Card>
  );
};
