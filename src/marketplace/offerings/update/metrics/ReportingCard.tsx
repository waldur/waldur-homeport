import { FC } from 'react';
import { OfferingMetric } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

const apiRoot = () =>
  (ENV.apiEndpoint?.startsWith('http')
    ? ENV.apiEndpoint
    : `${window.location.origin}/${(ENV.apiEndpoint || '').replace(/^\//, '')}`
  ).replace(/\/?$/, '/');

const nativeExample = (metric?: OfferingMetric) =>
  JSON.stringify(
    [
      {
        resource: '<resource UUID>',
        metric: metric?.key ?? '<metric key>',
        timestamp: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
        value: 14,
        attributes: Object.fromEntries(
          (metric?.attribute_keys ?? []).map((key) => [key, '<value>']),
        ),
      },
    ],
    null,
    2,
  );

const collectorExample = (root: string) => `exporters:
  otlphttp/waldur:
    metrics_endpoint: ${root}api/otlp/v1/metrics
    headers:
      Authorization: Token <Waldur API token>

processors:
  resource/waldur:
    attributes:
      - key: waldur.resource.uuid
        value: <resource UUID>
        action: upsert

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [resource/waldur]
      exporters: [otlphttp/waldur]`;

const Item: FC<{ label: string; description: string; value: string }> = ({
  label,
  description,
  value,
}) => (
  <FormTable.Item
    label={label}
    description={description}
    value={
      <pre className="fs-7 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
        {value}
      </pre>
    }
    actions={<CopyToClipboardButton value={value} verbose={label} onlyButton />}
  />
);

export const ReportingCard: FC<{ metrics: OfferingMetric[] }> = ({
  metrics,
}) => {
  const root = apiRoot();
  return (
    <FormTable.Card
      title={translate('Reporting')}
      className="card-bordered mt-5"
    >
      <FormTable alignTop>
        <Item
          label={translate('Endpoint')}
          description={translate('One point or a list per request.')}
          value={`POST ${root}api/marketplace-metric-points/`}
        />
        <Item
          label={translate('Example request')}
          description={translate(
            'Sending the same point again replaces its value.',
          )}
          value={nativeExample(metrics.find((m) => m.state === 'active'))}
        />
        <Item
          label={translate('OpenTelemetry Collector')}
          description={translate(
            'For services that already emit OpenTelemetry metrics.',
          )}
          value={collectorExample(root)}
        />
      </FormTable>
    </FormTable.Card>
  );
};
