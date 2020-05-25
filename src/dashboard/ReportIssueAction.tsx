import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { MessageDialog } from '@waldur/core/MessageDialog';
import { ENV, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { IssueCreateDialog } from '@waldur/issues/create/IssueCreateDialog';
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
      const features = ngInjector.get('features');
      if (features.isVisible('support')) {
        store.dispatch(
          openModalDialog(IssueCreateDialog, {
            resolve: {
              issue: props.issue,
            },
          }),
        );
      } else {
        const context = { supportEmail: ENV.supportEmail };
        const message = translate(
          'To report an issue, please send an email to <a href="mailto:{supportEmail}">{supportEmail}</a>.',
          context,
        );
        store.dispatch(
          openModalDialog(MessageDialog, {
            resolve: {
              title: translate('Report an issue'),
              message: <FormattedHtml html={message} />,
            },
          }),
        );
      }
    },
  };
};
