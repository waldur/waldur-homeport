import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { SupportEventsList } from '@waldur/support/SupportEventsList';
import { SupportEventsListFilter } from '@waldur/support/SupportEventsListFilter';

export const SupportEventsContainer = () => {
  useTitle(translate('Audit logs'));
  return <SupportEventsList filters={<SupportEventsListFilter />} />;
};
