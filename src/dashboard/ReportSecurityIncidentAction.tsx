import { ENV } from '@waldur/configs/default';
import { MessageDialog } from '@waldur/core/MessageDialog';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { openReportSecurityIncidentDialog } from '@waldur/issues/security-incident/store/actions';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

export const getReportSecurityIncidentAction = (
  showProjectField = true,
  showResourceField = true,
) => ({
  title: translate('Report a security incident'),
  onClick() {
    if (isFeatureVisible('support')) {
      store.dispatch(
        openReportSecurityIncidentDialog(showProjectField, showResourceField),
      );
    } else {
      store.dispatch(
        openModalDialog(MessageDialog, {
          resolve: {
            title: translate('Report a security incident'),
            message: translate(
              'To report a security incident, please send an email to {supportEmail}.',
              {
                supportEmail: (
                  <a href={`mailto:${ENV.supportEmail}`}>{ENV.supportEmail}</a>
                ),
              },
              formatJsxTemplate,
            ),
          },
        }),
      );
    }
  },
});
