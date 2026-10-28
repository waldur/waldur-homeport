import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

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
      <div>
        <Field
          label={translate('QoS')}
          value={String(attributes.qos)}
          labelCol={5}
          valueCol={7}
        />
      </div>
    ) : null}
    {attributes?.partition ? (
      <div>
        <Field
          label={translate('Partition')}
          value={String(attributes.partition)}
          labelCol={5}
          valueCol={7}
        />
      </div>
    ) : null}
  </>
);
