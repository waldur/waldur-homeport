import { Col } from 'react-bootstrap';

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
      <Col sm={6}>
        <Field
          label={translate('QoS')}
          value={String(attributes.qos)}
          labelCol={5}
          valueCol={7}
        />
      </Col>
    ) : null}
    {attributes?.partition ? (
      <Col sm={6}>
        <Field
          label={translate('Partition')}
          value={String(attributes.partition)}
          labelCol={5}
          valueCol={7}
        />
      </Col>
    ) : null}
  </>
);
