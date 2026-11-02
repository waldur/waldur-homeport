import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';

type Attributes = Record<string, unknown>;

export const hasSlurmPlacement = (attributes?: Attributes) =>
  Boolean(attributes?.qos || attributes?.partition);

// Set by call templates, not offering options, so User inputs never lists them.
export const SlurmPlacementFields = ({
  attributes,
}: {
  attributes?: Attributes;
}) => (
  <>
    {attributes?.qos ? (
      <PropertyItem label={translate('QoS')} value={String(attributes.qos)} />
    ) : null}
    {attributes?.partition ? (
      <PropertyItem
        label={translate('Partition')}
        value={String(attributes.partition)}
      />
    ) : null}
  </>
);
