import { ENV } from '@waldur/configs/default';
import { MessageDialog } from '@waldur/core/MessageDialog';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

interface ReportIssueActionProps {
  issue: any;
  hideProjectAndResourceFields?: boolean;
}

export const getIssueAction = (props: ReportIssueActionProps) => {
  return {
    title: translate('Report an issue'),
    onClick() {
      if (ENV.plugins.WALDUR_SUPPORT) {
        store.dispatch(
          openIssueCreateDialog({
            issue: props.issue,
            hideProjectAndResourceFields: props.hideProjectAndResourceFields,
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
                    <a href={`mailto:${ENV.plugins.WALDUR_CORE.SITE_EMAIL}`}>
                      {ENV.plugins.WALDUR_CORE.SITE_EMAIL}
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
