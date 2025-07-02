import { translate } from '@waldur/i18n';
import { ActionGroup } from '@waldur/marketplace/resources/actions/ActionGroup';
import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { CreateLexisLinkAction } from '@waldur/marketplace/resources/lexis/CreateLexisLinkAction';
import { ReportUsageAction } from '@waldur/marketplace/resources/list/ReportUsageAction';
import { ReportUserUsageAction } from '@waldur/marketplace/resources/list/ReportUserUsageAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { SetErredActionItem } from '@waldur/resource/actions/SetErredActionItem';

export const ProviderActionsGroup = (props) => (
  <ActionGroup title={translate('Provider actions')}>
    <ReportUsageAction {...props} />
    <ReportUserUsageAction {...props} />
    <SetBackendIdAction {...props} />
    <SubmitReportAction {...props} />
    <EditResourceEndDateAction {...props} />
    <CreateLexisLinkAction {...props} />
    <SetErredActionItem {...props} />
  </ActionGroup>
);
