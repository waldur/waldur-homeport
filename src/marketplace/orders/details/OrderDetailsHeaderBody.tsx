import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field } from '@waldur/resource/summary';

import { getOrderType } from '../utils';

const PurchaseOrderBadge = ({ order, offering }) => {
  const requireUpload = offering?.plugin_options?.require_purchase_order_upload;
  const enableUpload = offering?.plugin_options?.enable_purchase_order_upload;

  if (!enableUpload && !requireUpload) return null;

  if (order.attachment) {
    return (
      <Badge variant="success" size="sm" pill outline>
        {translate('Uploaded')}
      </Badge>
    );
  }

  if (requireUpload) {
    return (
      <Badge variant="warning" size="sm" pill outline>
        {translate('Required')}
      </Badge>
    );
  }

  return (
    <Badge variant="default" size="sm" pill outline>
      {translate('Optional')}
    </Badge>
  );
};

export const OrderDetailsHeaderBody = ({ order, offering = undefined }) => {
  const typeBadge = useMemo(() => getOrderType(order), [order]);

  const showPurchaseOrder =
    offering?.plugin_options?.enable_purchase_order_upload ||
    offering?.plugin_options?.require_purchase_order_upload;

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
      </Col>
      {showPurchaseOrder && (
        <Col sm="auto">
          <Field
            label={translate('Purchase order')}
            value={<PurchaseOrderBadge order={order} offering={offering} />}
            labelClass="w-125px"
            labelCol="auto"
            valueCol="auto"
          />
        </Col>
      )}
    </Row>
  );
};
