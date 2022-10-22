import { SupportEventsList } from '@waldur/support/SupportEventsList';
import { SupportEventsListFilter } from '@waldur/support/SupportEventsListFilter';

export const SupportEventsContainer = () => {
  return <SupportEventsList filters={<SupportEventsListFilter />} />;
};
