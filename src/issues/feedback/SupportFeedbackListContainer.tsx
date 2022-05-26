import { translate } from '@waldur/i18n';
import { SupportFeedbackList } from '@waldur/issues/feedback/SupportFeedbackList';
import { SupportFeedbackListFilter } from '@waldur/issues/feedback/SupportFeedbackListFilter';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useSidebarKey } from '@waldur/navigation/context';
import { useSupportItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { useSupport } from '../hooks';

export const SupportFeedbackListContainer = () => {
  useTitle(translate('Feedback'));
  useReportingBreadcrumbs();
  useSidebarKey('reporting');
  useSupport();
  useSupportItems();
  return <SupportFeedbackList filters={<SupportFeedbackListFilter />} />;
};
