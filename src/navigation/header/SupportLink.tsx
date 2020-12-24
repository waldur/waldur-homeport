import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { IssueNavigationService } from '@waldur/issues/workspace/IssueNavigationService';
import { router } from '@waldur/router';
import { isVisible } from '@waldur/store/config';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

const showLink = (state: OuterState) => {
  if (isVisible(state, 'support')) {
    return true;
  }
  const user = getUser(state);
  return user && (user.is_staff || user.is_support);
};

export const SupportLink: FunctionComponent = () => {
  const visible = useSelector(showLink);

  if (!visible) {
    return null;
  }

  const gotoSupport = () => IssueNavigationService.gotoDashboard();

  const isActive =
    router.stateService.includes('support') ||
    router.stateService.is('support');

  return (
    <li>
      <a onClick={gotoSupport} className={isActive ? 'active' : ''}>
        <i className="fa fa-question-circle"></i> {translate('Support')}
      </a>
    </li>
  );
};
