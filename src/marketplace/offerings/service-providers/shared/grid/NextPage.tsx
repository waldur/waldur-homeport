import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import './PageActions.scss';

interface NextPageProps {
  disabled?: boolean;
  onClick?: () => void;
}

export const NextPage: FunctionComponent<NextPageProps> = ({
  disabled,
  onClick,
}) => (
  <div
    className={classNames('pageAction', {
      'pageAction--disabled': disabled,
    })}
    onClick={onClick}
  >
    {translate('Next')} <i className="fa fa-chevron-right m-l" />
  </div>
);
