import { translate } from '@waldur/i18n';
import { SupportFeedbackList } from '@waldur/issues/feedback/SupportFeedbackList';
import { SupportFeedbackListFilter } from '@waldur/issues/feedback/SupportFeedbackListFilter';
import { useReportingTabs } from '@waldur/issues/workspace/SupportWorkspace';
import { useSupportItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { useSupport } from '../hooks';

export const SupportFeedbackListContainer = () => {
  useTitle(translate('Feedback'));
  useReportingTabs();
  useSupport();
  useSupportItems();
  return <SupportFeedbackList filters={<SupportFeedbackListFilter />} />;
};
