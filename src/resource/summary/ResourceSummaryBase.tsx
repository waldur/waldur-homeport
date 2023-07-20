import { Col, Row } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { ParentResourceLink } from '@waldur/marketplace/resources/details/ParentResourceLink';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource } from '@waldur/resource/types';

import { CreatedField } from './CreatedField';
import { ErrorMessageField } from './ErrorMessageField';
import { Field } from './Field';
import { ResourceMetadataLink } from './ResourceMetadataLink';
import { ResourceTitle } from './ResourceTitle';
import { ResourceSummaryProps } from './types';

export function ResourceSummaryBase<T extends Resource = any>(
  props: ResourceSummaryProps<T>,
) {
  const { resource } = props;
  return (
    <>
      <div className="mb-6">
        <ResourceTitle resource={resource} />
        <ParentResourceLink resource={resource as any} />
      </div>

      <Row>
        <Col xs={12} xl={6}>
          <Field
            label={translate('State')}
            value={<ResourceState {...props} />}
          />
          <ErrorMessageField {...props} />
          {!props.resource.marketplace_offering_uuid && (
            <Field
              label={translate('Provider')}
              value={resource.service_name}
            />
          )}
          <Field
            label={translate('Description')}
            value={resource.description}
          />
          <Field
            label={translate('Created')}
            value={<CreatedField resource={props.resource} />}
          />
          {ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE ? (
            <Field
              label={translate('Termination date')}
              value={resource.end_date}
            />
          ) : null}
        </Col>
        <Col xs={12} xl={6}>
          <Field
            label={translate('Metadata')}
            value={ResourceMetadataLink(props)}
            valueClass="text-decoration-underline"
          />
        </Col>
      </Row>
    </>
  );
}
