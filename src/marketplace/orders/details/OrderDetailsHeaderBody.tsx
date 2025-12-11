import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field } from '@waldur/resource/summary';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';

import { getOrderType } from '../utils';

export const OrderDetailsHeaderBody = ({ order }) => {
  const typeBadge = useMemo(() => getOrderType(order), [order]);

  return (
    <Row>
      <Col sm="auto">
        <Field
          label={translate('Organization')}
          value={order.customer_name}
          labelClass="w-100px"
          labelCol="auto"
          valueCol="auto"
        />
        <Field
          label={translate('Project')}
          value={order.project_name}
          labelClass="w-100px"
          labelCol="auto"
          valueCol="auto"
        />
      </Col>
      <Col sm="auto">
        <Field
          label={translate('Resource')}
          value={
            <ResourceLink
              uuid={order.marketplace_resource_uuid}
              label={order.resource_name}
            />
          }
          labelClass="w-100px"
          labelCol="auto"
          valueCol="auto"
        />
        <Field
          label={translate('Type')}
          value={
            <Badge variant={typeBadge.variant} size="sm" pill outline>
              {typeBadge.label}
            </Badge>
          }
          labelClass="w-100px"
          labelCol="auto"
          valueCol="auto"
        />
        {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
          <Field
            label={translate('Issue')}
            value={
              <Link
                state="support-detail"
                params={{ issue_uuid: order.issue.uuid }}
                label={order.issue.key || order.issue.uuid}
                className="text-link"
              />
            }
            labelClass="w-100px"
            labelCol="auto"
            valueCol="auto"
          />
        )}
      </Col>
    </Row>
  );
};
