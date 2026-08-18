import {
  CheckCircleIcon,
  EnvelopeIcon,
  PaperclipIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { stripHtml } from '@/core/sanitize';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { hasFreshConsumerResponse } from '../utils';

/**
 * State of the provider/customer exchange, so a service provider can tell from
 * the table which orders are still waiting on the customer and which have had
 * their signed agreement uploaded — without opening each order. The message
 * itself stays in the tooltip and the expandable row.
 */
const getOrderCommunication = (
  order: OrderDetails,
): {
  label: string;
  variant: string;
  icon: ReactNode;
  message: string;
} | null => {
  if (!order.provider_message && !order.consumer_message) return null;

  if (hasFreshConsumerResponse(order)) {
    return {
      label: order.consumer_message_attachment
        ? translate('Attachment received')
        : translate('Customer responded'),
      variant: 'success',
      icon: order.consumer_message_attachment ? (
        <PaperclipIcon weight="bold" />
      ) : (
        <CheckCircleIcon weight="bold" />
      ),
      message: stripHtml(order.consumer_message || ''),
    };
  }
  return {
    label: translate('Information requested'),
    variant: 'warning',
    icon: <EnvelopeIcon weight="bold" />,
    message: stripHtml(order.provider_message || ''),
  };
};

export const OrderCommunicationCell: FC<{ row: OrderDetails }> = ({ row }) => {
  const info = getOrderCommunication(row);
  if (!info) return <>{DASH_ESCAPE_CODE}</>;

  return (
    <Badge
      variant={info.variant}
      leftIcon={info.icon}
      pill
      outline
      tooltip={info.message || undefined}
    >
      {info.label}
    </Badge>
  );
};
