import * as React from 'react';
import { useSelector } from 'react-redux';

import { ngInjector, $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { isVisible } from '@waldur/store/config';
import { getUser } from '@waldur/workspace/selectors';

const showLink = state => {
  if (isVisible(state, 'support')) {
    return true;
  }
  const user = getUser(state);
  return user && (user.is_staff || user.is_support);
};

export const SupportLink = () => {
  const visible = useSelector(showLink);

  if (!visible) {
    return null;
  }

  const gotoSupport = () =>
    ngInjector.get('IssueNavigationService').gotoDashboard();

  const isActive = $state.includes('support') || $state.is('support');

  return (
    <li>
      <a onClick={gotoSupport} className={isActive ? 'active' : ''}>
        <i className="fa fa-question-circle"></i> {translate('Support')}
      </a>
    </li>
  );
};
