import { Card } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { Field } from '@waldur/resource/summary';

export const OrderMetadataTab = ({ order, offering }) => {
  const DetailsComponent = getDetailsComponent(order.offering_type);
  return (
    <Card>
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Metadata')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body className="custom-padding-zero">
        <div className="container ml-0">
          <Field
            label={translate('Resource UUID')}
            value={order.marketplace_resource_uuid}
          />
          {order.backend_id && (
            <Field
              label={translate('Backend ID')}
              value={order.created_by_full_name}
            />
          )}
          <Field
            label={translate('Provider name')}
            value={order.provider_name}
          />
          <Field
            label={translate('Provider UUID')}
            value={order.provider_uuid}
          />
          <Field
            label={translate('Offering UUID')}
            value={order.offering_uuid}
          />
          {offering.components.length > 0 && (
            <Field
              label={translate('Components')}
              value={offering.components
                .map((component) => component.type)
                .join(', ')}
            />
          )}
          <Field
            label={translate('Offering billable?')}
            value={order.offering_billable ? 'Yes' : 'No'}
          />
          <Field
            label={translate('Offerring description')}
            value={<FormattedHtml html={order.offering_description} />}
          />
          <Field
            label={translate('Offering shared?')}
            value={order.offering_shared ? 'Yes' : 'No'}
          />
          <Field
            label={translate('Offering type')}
            value={order.offering_type}
          />
          <Field
            label={translate('Offering terms of service')}
            value={order.offering_terms_of_service}
          />
          {DetailsComponent && (
            <DetailsComponent order={order} offering={offering} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};
