import eventsRegistry from '@waldur/events/registry';
import { getCustomerContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

eventsRegistry.registerGroup({
  title: gettext('Payment events'),
  context: getCustomerContext,
  events: [
    {
      key: 'payment_approval_succeeded',
      title: gettext('Payment for {customer_link} has been approved.'),
    },
    {
      key: 'payment_cancel_succeeded',
      title: gettext('Payment for {customer_link} has been cancelled.'),
    },
    {
      key: 'payment_creation_succeeded',
      title: gettext('Created a new payment for {customer_link}.'),
    },
  ],
});
