import { EventGroup } from '@/events/types';
import { getCustomerContext } from '@/events/utils';
import { translate } from '@/i18n';

import { InvoicesEnum } from '../EventsEnums';

const getInvoiceContext = (event) => ({
  ...getCustomerContext(event),
  period: event.invoice_date,
});

export const InvoiceEvents: EventGroup = {
  title: translate('Invoice events'),
  context: getInvoiceContext,
  events: [
    {
      key: InvoicesEnum.invoice_created,
      title: translate(
        'Invoice for organization {customer_link} for the period of {period} has been created.',
      ),
    },
    {
      key: InvoicesEnum.invoice_canceled,
      title: translate(
        'Invoice for organization {customer_name} for the period of {period} has been canceled.',
      ),
    },
    {
      key: InvoicesEnum.invoice_paid,
      title: translate(
        'Invoice for organization {customer_link} for the period of {period} has been paid.',
      ),
    },
  ],
};
