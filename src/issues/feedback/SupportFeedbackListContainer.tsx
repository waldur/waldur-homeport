import { translate } from '@waldur/i18n';
import { SupportFeedbackList } from '@waldur/issues/feedback/SupportFeedbackList';
import { SupportFeedbackListFilter } from '@waldur/issues/feedback/SupportFeedbackListFilter';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

export const SupportFeedbackListContainer = () => {
  useTitle(translate('Feedback'));
  useReportingBreadcrumbs();
  return (
    <div className="ibox">
      <div className="ibox-content">
        <SupportFeedbackListFilter />
        <SupportFeedbackList />
      </div>
    </div>
  );
};
