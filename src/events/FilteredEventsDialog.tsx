import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

export const FilteredEventsDialog = ({ filter }) => (
  <ModalDialog
    headerLess
    bodyClassName="p-0"
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <BaseEventsList
      table="scope-events"
      title={translate('History log')}
      filter={filter}
      initialPageSize={5}
    />
  </ModalDialog>
);
