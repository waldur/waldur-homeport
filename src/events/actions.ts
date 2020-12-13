import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const EventDetailsDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "EventDetailsDialog" */ './EventDetailsDialog'),
  'EventDetailsDialog',
);
const EventTypesDialog = lazyComponent(
  () => import(/* webpackChunkName: "EventTypesDialog" */ './EventTypesDialog'),
  'EventTypesDialog',
);

export const showEventTypes = () => openModalDialog(EventTypesDialog);

export const showEventDetails = (event) =>
  openModalDialog(EventDetailsDialog, { resolve: { event } });
