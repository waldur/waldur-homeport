import { FunctionComponent } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { FormattedHtml } from '@/core/FormattedHtml';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { OrderNameField } from '@/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@/marketplace/orders/list/ResourceNameField';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { OrderProviderActions } from '../actions/OrderProviderActions';

export const OrdersListExpandableRow: FunctionComponent<{
  row: OrderDetails;
}> = ({ row: order }) => (
  <ExpandableContainer asTable hasMultiSelect>
    <Field
      label={translate('Project description')}
      value={order.project_description}
    />

    <Field
      label={translate('Offering')}
      value={<OrderNameField row={order} />}
    />

    <Field
      label={translate('Resource')}
      value={<ResourceNameField row={order} />}
    />

    <Field label={translate('Type')} value={<OrderTypeCell row={order} />} />
    <Field label={translate('State')} value={<OrderStateCell row={order} />} />
    <Field
      label={translate('Plan')}
      value={renderFieldOrDash(order.plan_name)}
    />

    {order.attachment ? (
      <Field
        label={translate('Purchase order')}
        value={
          <FileDownloader url={order.attachment} name={translate('PDF file')} />
        }
      />
    ) : null}

    {order.request_comment ? (
      <Field label={translate('PO reference')} value={order.request_comment} />
    ) : null}

    {order.provider_message ? (
      <Field
        label={translate('Provider message')}
        value={<FormattedHtml html={order.provider_message} />}
      />
    ) : null}

    {order.consumer_message ? (
      <Field
        label={translate('Customer response')}
        value={<FormattedHtml html={order.consumer_message} />}
      />
    ) : null}

    {order.consumer_message_attachment ? (
      <Field
        label={translate('Customer attachment')}
        value={
          <FileDownloader
            url={order.consumer_message_attachment}
            name={translate('PDF file')}
          />
        }
      />
    ) : null}

    {order.state === 'pending-provider' && (
      <Field
        label={translate('Actions')}
        value={<OrderProviderActions order={order} size="sm" />}
      />
    )}
  </ExpandableContainer>
);
