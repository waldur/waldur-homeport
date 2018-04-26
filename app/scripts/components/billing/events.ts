import { getCustomerContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { gettext } from '@waldur/i18n';

const getInvoiceContext = event => ({
  ...getCustomerContext(event),
  period: event.invoice_date,
});

eventsRegistry.register({
  title: gettext('Invoice events'),
  context: getInvoiceContext,
  events: [
    {
      key: 'invoice_creation_succeeded',
      title: gettext('Invoice for organization {customer_link} for the period of {period} has been created.'),
    },
    {
      key: 'invoice_deletion_succeeded',
      title: gettext('Invoice for organization {customer_name} for the period of {period} has been deleted.'),
    },
    {
      key: 'invoice_update_succeeded',
      title: gettext('Invoice for organization {customer_link} for the period of {period} has been updated.'),
    },
  ],
});
