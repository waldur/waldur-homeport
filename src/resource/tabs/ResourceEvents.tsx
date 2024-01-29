import { getEventsList } from '@waldur/events/BaseEventsList';

export const ResourceEvents = getEventsList({
  mapPropsToFilter: (props) => ({ scope: props.marketplaceResource?.url }),
  mapPropsToTableId: (props) => [props.marketplaceResource?.uuid],
});
