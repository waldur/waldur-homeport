import { getCustomerContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

const getInvoiceContext = event => ({
  ...getCustomerContext(event),
  period: event.invoice_date,
});

eventsRegistry.register({
  invoice_creation_succeeded: event =>
    translate('Invoice for organization {customer} for the period of {period} has been created.', getInvoiceContext(event)),

  invoice_deletion_succeeded: event =>
    translate('Invoice for organization {customer} for the period of {period} has been deleted.', getInvoiceContext(event)),

  invoice_update_succeeded: event =>
    translate('Invoice for organization {customer} for the period of {period} has been updated.', getInvoiceContext(event)),
});
