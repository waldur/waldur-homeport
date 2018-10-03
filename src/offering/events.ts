import eventsRegistry from '@waldur/events/registry';
import { getLink } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

const getOfferingContext = event => ({
  offering_link: getLink('offeringDetails', {uuid: event.offering_uuid}, event.offering_name),
});

eventsRegistry.registerGroup({
  title: gettext('Offering events'),
  context: getOfferingContext,
  events: [
    {
      key: 'offering_created',
      title: gettext('Offering {offering_link} has been created.'),
    },
    {
      key: 'offering_deleted',
      title: gettext('Offering {offering_name} has been deleted.'),
    },
    {
      key: 'offering_state_changed',
      title: gettext('Offering state has changed to {offering_state}.'),
    },
  ],
});
