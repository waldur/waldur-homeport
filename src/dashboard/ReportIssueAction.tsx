import { ENV } from '@waldur/configs/default';
import { MessageDialog } from '@waldur/core/MessageDialog';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

interface ReportIssueActionProps {
  issue: any;
  state: string;
}

export const getIssueAction = (props: ReportIssueActionProps) => {
  return {
    title: translate('Report an issue'),
    onClick() {
      if (isFeatureVisible('support')) {
        store.dispatch(
          openIssueCreateDialog({
            issue: props.issue,
          }),
        );
      } else {
        store.dispatch(
          openModalDialog(MessageDialog, {
            resolve: {
              title: translate('Report an issue'),
              message: translate(
                'To report an issue, please send an email to {supportEmail}.',
                {
                  supportEmail: (
                    <a href={`mailto:${ENV.supportEmail}`}>
                      {ENV.supportEmail}
                    </a>
                  ),
                },
                formatJsxTemplate,
              ),
            },
          }),
        );
      }
    },
  };
};
