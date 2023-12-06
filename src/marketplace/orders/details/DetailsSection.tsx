import { Accordion } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { OrderDetailsProps } from '@waldur/marketplace/types';

import { DetailsField } from '../../common/DetailsField';

export const DetailsSection = ({ order, offering }: OrderDetailsProps) => {
  const DetailsComponent = getDetailsComponent(order.offering_type);
  return (
    <Accordion.Item eventKey="details">
      <Accordion.Header>{translate('Details')}</Accordion.Header>
      <Accordion.Body>
        {order.marketplace_resource_uuid && (
          <DetailsField label={translate('Resource UUID')}>
            {order.marketplace_resource_uuid}
          </DetailsField>
        )}
        <DetailsField label={translate('Created at')}>
          {formatDateTime(order.created)}
        </DetailsField>
        {offering.components.length > 0 && (
          <DetailsField label={translate('Components')}>
            {offering.components.map((component) => component.type).join(', ')}
          </DetailsField>
        )}
        {order.attributes.name && (
          <DetailsField label={translate('Resource name')}>
            {order.attributes.name}
          </DetailsField>
        )}
        {order.attributes.description && (
          <DetailsField label={translate('Resource description')}>
            {order.attributes.description}
          </DetailsField>
        )}
        {order.issue && (
          <DetailsField label={translate('Issue')}>
            <Link
              state="support.detail"
              params={{ uuid: order.issue.uuid }}
              label={order.issue.key || 'N/A'}
            />
          </DetailsField>
        )}
        {DetailsComponent && (
          <DetailsComponent order={order} offering={offering} />
        )}
        {order.output && (
          <DetailsField label={translate('Output')}>
            <pre>{order.output}</pre>
          </DetailsField>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};
