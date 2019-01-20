import * as React from 'react';

import { $state, ENV, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';

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
        $uibModal.open({
          component: 'issueCreateDialog',
          resolve: {
            issue: () => props.issue,
          },
        }).result.then(() => {
          $state.go(props.state);
        });
      } else {
        const context = {supportEmail: ENV.supportEmail};
        const message = translate('To report an issue, please send an email to <a href="mailto:{supportEmail}">{supportEmail}</a>.', context);
        $uibModal.open({
          component: 'messageDialog',
          resolve: {
            title: () => translate('Report an issue'),
            message: () => <p dangerouslySetInnerHTML={{__html: message}}/>,
          },
        });
      }
    },
  };
};
