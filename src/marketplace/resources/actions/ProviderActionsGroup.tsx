import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { EditResourceEndDateAction } from '@/marketplace/resources/actions/EditResourceEndDateAction';
import { CreateLexisLinkAction } from '@/marketplace/resources/lexis/CreateLexisLinkAction';
import { ReportUsageAction } from '@/marketplace/resources/list/ReportUsageAction';
import { ReportUserUsageAction } from '@/marketplace/resources/list/ReportUserUsageAction';
import { SubmitReportAction } from '@/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@/marketplace/resources/SetBackendIdAction';
import { SetErredActionItem } from '@/resource/actions/SetErredActionItem';

export const ProviderActionsGroup = (props: any) => (
  <ActionGroup title={translate('Provider actions')}>
    <ReportUsageAction {...props} />
    <ReportUserUsageAction {...props} />
    <SetBackendIdAction {...props} />
    <SubmitReportAction {...props} />
    <EditResourceEndDateAction {...props} />
    <CreateLexisLinkAction {...props} />
    <SetErredActionItem {...props} />
    {props.children}
  </ActionGroup>
);
