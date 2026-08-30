import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Col, Row } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { ResourceLink } from '@/resource/ResourceLink';
import { Field } from '@/resource/summary';

import { OrderDetailsQuickBody } from './OrderDetailsQuickBody';

const PurchaseOrderBadge = ({ order, offering }) => {
  const requireUpload = offering?.plugin_options?.require_purchase_order_upload;
  const enableUpload = offering?.plugin_options?.enable_purchase_order_upload;

  if (!enableUpload && !requireUpload) return null;

  if (order.attachment) {
    return (
      <FileDownloader
        url={order.attachment}
        name={translate('PDF file')}
        className="text-btn d-inline-flex align-items-center gap-1 text-decoration-none"
      >
        <Badge
          variant="success"
          size="sm"
          leftIcon={<DownloadSimpleIcon weight="bold" size={12} />}
          pill
          outline
        >
          {translate('Download')}
        </Badge>
      </FileDownloader>
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
        <OrderDetailsQuickBody order={order} autoWidth />
        <Field
          label={translate('Offering')}
          value={
            <Link
              state="public-offering.marketplace-public-offering"
              params={{ uuid: order.offering_uuid }}
              className="text-link"
            >
              {order.offering_name}
            </Link>
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
