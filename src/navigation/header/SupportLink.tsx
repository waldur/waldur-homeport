import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { IssueNavigationService } from '@waldur/issues/workspace/IssueNavigationService';
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

  return (
    <div
      className="aside-footer flex-column-auto pt-5 pb-7 px-5"
      onClick={() => IssueNavigationService.gotoDashboard()}
    >
      <a className="btn btn-custom btn-primary w-100">
        <span className="btn-label">
          <i className="fa fa-question-circle"></i> {translate('Support')}
        </span>
      </a>
    </div>
  );
};
