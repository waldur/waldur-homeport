import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { MessageDialog } from '@waldur/core/MessageDialog';
import { ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { openReportSecurityIncidentDialog } from '@waldur/issues/security-incident/store/actions';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

export const getReportSecurityIncidentAction = () => ({
  title: translate('Report security incident'),
  onClick() {
    if (isFeatureVisible('support')) {
      store.dispatch(openReportSecurityIncidentDialog());
    } else {
      const context = { supportEmail: ENV.supportEmail };
      const message = translate(
        'To report a security incident, please send an email to <a href="mailto:{supportEmail}">{supportEmail}</a>.',
        context,
      );
      store.dispatch(
        openModalDialog(MessageDialog, {
          resolve: {
            title: translate('Report security incident'),
            message: <FormattedHtml html={message} />,
          },
        }),
      );
    }
  },
});
