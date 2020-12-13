import { createFormAction } from 'redux-form-saga';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';

const UserDetailsDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "UserDetailsDialog" */ './UserDetailsDialog'),
  'UserDetailsDialog',
);
const UserRemovalMessageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserRemovalMessageDialog" */ './UserRemovalMessageDialog'
    ),
  'UserRemovalMessageDialog',
);

export const showUserDetails = (user) =>
  openModalDialog(UserDetailsDialog, { resolve: { user }, size: 'lg' });

export const showUserRemoval = () => {
  const resolve = {
    issue: {
      type: ISSUE_IDS.CHANGE_REQUEST,
      summary: 'Account removal',
    },
    options: {
      title: translate('Account removal'),
      hideTitle: true,
      descriptionPlaceholder: translate(
        'Why would you want to go away? Help us become better please!',
      ),
      descriptionLabel: translate('Reason'),
      submitTitle: translate('Request removal'),
    },
  };
  return openIssueCreateDialog(resolve);
};

export const showUserRemovalMessage = (resolve) => {
  return openModalDialog(UserRemovalMessageDialog, { resolve });
};

export const updateUser = createFormAction('waldur/user/UPDATE');
export const activateUser = createFormAction('waldur/user/ACTIVATE');
export const deactivateUser = createFormAction('waldur/user/DEACTIVATE');
