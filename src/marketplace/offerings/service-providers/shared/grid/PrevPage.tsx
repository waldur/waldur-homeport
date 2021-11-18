import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import './PageActions.scss';

interface PrevPageProps {
  disabled?: boolean;
  onClick?: () => void;
}

export const PrevPage: FunctionComponent<PrevPageProps> = ({
  disabled,
  onClick,
}) => (
  <div
    className={classNames('pageAction', {
      'pageAction--disabled': disabled,
    })}
    onClick={onClick}
  >
    <i className="fa fa-chevron-left m-r" /> {translate('Previous')}
  </div>
);
