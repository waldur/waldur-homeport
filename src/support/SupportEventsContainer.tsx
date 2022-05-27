import { translate } from '@waldur/i18n';
import { useSupportItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';
import { SupportEventsList } from '@waldur/support/SupportEventsList';
import { SupportEventsListFilter } from '@waldur/support/SupportEventsListFilter';

export const SupportEventsContainer = () => {
  useTitle(translate('Audit logs'));
  useSupportItems();
  return <SupportEventsList filters={<SupportEventsListFilter />} />;
};
