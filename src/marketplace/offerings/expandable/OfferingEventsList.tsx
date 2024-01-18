import { getEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';

const List = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.offering.url,
  }),
  mapPropsToTableId: (props) => [props.offering.uuid],
});

export const OfferingEventsList = ({ offering }) => (
  <List offering={offering} title={translate('Events')} id="events" />
);
