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
  <button
    className={classNames('text-btn pageAction', {
      'pageAction--disabled': disabled,
    })}
    type="button"
    onClick={onClick}
  >
    {translate('Next')} <i className="fa fa-chevron-right m-l" />
  </button>
);
