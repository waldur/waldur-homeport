import { translate } from '@waldur/i18n';
import { SupportFeedbackList } from '@waldur/issues/feedback/SupportFeedbackList';
import { SupportFeedbackListFilter } from '@waldur/issues/feedback/SupportFeedbackListFilter';
import { useTitle } from '@waldur/navigation/title';

import { useSupport } from '../hooks';

export const SupportFeedbackListContainer = () => {
  useTitle(translate('Feedback'));
  useSupport();
  return <SupportFeedbackList filters={<SupportFeedbackListFilter />} />;
};
