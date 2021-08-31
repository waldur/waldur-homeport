import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { IssueNavigationService } from '@waldur/issues/workspace/IssueNavigationService';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

const showLink = (state: RootState) => {
  if (ENV.plugins.WALDUR_SUPPORT) {
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
