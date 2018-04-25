import { getCustomerContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

eventsRegistry.register({
  payment_approval_succeeded: event =>
    translate('Payment for {customer} has been approved.', getCustomerContext(event)),

  payment_cancel_succeeded: event =>
    translate('Payment for {customer} has been cancelled.', getCustomerContext(event)),

  payment_creation_succeeded: event =>
    translate('Created a new payment for {customer}.', getCustomerContext(event)),
});
