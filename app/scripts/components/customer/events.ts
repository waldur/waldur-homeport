import { getCustomerContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

eventsRegistry.register({
  customer_creation_succeeded: event =>
    translate('Organization {customer} has been created.', getCustomerContext(event)),

  customer_deletion_succeeded: event =>
    translate('Organization {customer} has been deleted.', getCustomerContext(event)),

  customer_update_succeeded: event =>
    translate('Organization {customer} has been updated.', getCustomerContext(event)),
});
