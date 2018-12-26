import { createFormAction } from 'redux-form-saga';

import { translate } from '@waldur/i18n';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';

export const showUserDetails = user =>
  openModalDialog('UserDetailsDialog', {resolve: { user }, size: 'lg'});

export const showUserRemoval = () => {
  const resolve = {
    issue: {
      type: ISSUE_IDS.CHANGE_REQUEST,
      summary: 'Account removal',
    },
    options: {
      title: translate('Account removal'),
      hideTitle: true,
      descriptionPlaceholder: translate('Why would you want to go away? Help us become better please!'),
      descriptionLabel: translate('Reason'),
      submitTitle: translate('Request removal'),
    },
  };
  return openModalDialog('issueCreateDialog', {resolve});
};

export const showUserRemovalMessage = resolve => {
  return openModalDialog('UserRemovalMessageDialog', {resolve});
};

export const updateUser = createFormAction('waldur/user/UPDATE');
export const activateUser = createFormAction('waldur/user/ACTIVATE');
export const deactivateUser = createFormAction('waldur/user/DEACTIVATE');
