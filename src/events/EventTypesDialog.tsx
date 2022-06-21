import { translate } from '@waldur/i18n';

import eventRegistry from './registry';
import { TypeListDialog } from './TypeListDialog';

export const EventTypesDialog = () => (
  <TypeListDialog
    types={eventRegistry.getGroups()}
    dialogTitle={translate('Event types')}
  />
);
