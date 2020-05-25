import { translate } from '@waldur/i18n';
import { IssueCreateDialog } from '@waldur/issues/create/IssueCreateDialog';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

import template from './request-direct-access.html';

class DialogController {
  // @ngInject
  constructor(features, ENV) {
    this.features = features;
    this.ENV = ENV;
  }

  $onInit() {
    this.tenant = this.resolve.resource;
    this.supportEmail = this.ENV.supportEmail;
    const supportEnabled = this.features.isVisible('support');

    if (supportEnabled) {
      this.close();
      store.dispatch(
        openModalDialog(IssueCreateDialog, {
          resolve: {
            issue: () => ({
              type: ISSUE_IDS.SERVICE_REQUEST,
              summary: translate('Request direct access to OpenStack Tenant'),
              resource: this.tenant,
            }),
            options: {
              title: translate('Request direct access to OpenStack Tenant'),
              descriptionPlaceholder: translate('Please provide a reason'),
              descriptionLabel: translate('Description'),
              summaryLabel: translate('Tenant name'),
              hideTitle: true,
            },
          },
        }),
      );
    }
  }
}

const openstackTenantRequestDirectAccess = {
  template: template,
  controller: DialogController,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
};

export default openstackTenantRequestDirectAccess;
