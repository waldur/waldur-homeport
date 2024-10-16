import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

const eventsFilter = {
  event_type: [
    'update_of_credit_by_staff',
    'create_of_credit_by_staff',
    'set_to_zero_overdue_credit',
  ],
};

export const CreditHistoryLogDialog = () => {
  return (
    <MetronicModalDialog headerLess bodyClassName="p-0">
      <BaseEventsList
        table="credit-history-events"
        title={translate('History log')}
        filter={eventsFilter}
        initialPageSize={5}
      />
    </MetronicModalDialog>
  );
};
