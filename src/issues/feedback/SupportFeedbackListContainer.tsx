import { SupportFeedbackList } from '@waldur/issues/feedback/SupportFeedbackList';
import { SupportFeedbackListFilter } from '@waldur/issues/feedback/SupportFeedbackListFilter';

export const SupportFeedbackListContainer = () => {
  return <SupportFeedbackList filters={<SupportFeedbackListFilter />} />;
};
