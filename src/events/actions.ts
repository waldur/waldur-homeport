import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const EventTypesDialog = lazyComponent(
  () => import(/* webpackChunkName: "EventTypesDialog" */ './EventTypesDialog'),
  'EventTypesDialog',
);

export const showEventTypes = () => openModalDialog(EventTypesDialog);
