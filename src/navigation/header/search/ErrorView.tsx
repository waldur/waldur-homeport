import { WarningCircle } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import './NoResult.scss';

import Bg from './Background.svg';

interface ErrorViewProps {
  isVisible?: boolean;
  style?: CSSProperties;
}

export const ErrorView: FC<ErrorViewProps> = ({ isVisible = true, style }) => {
  return (
    <div
      className={classNames('search-error', !isVisible && 'd-none')}
      style={style}
    >
      <Bg className="background" />
      <div className="text-center d-flex flex-column align-items-center gap-6 pb-10 position-relative z-index-1">
        <div className="error-icon">
          <WarningCircle size={25} />
        </div>

        <div>
          <h4 className="fw-bold mb-2">{translate('Something went wrong')}</h4>
          <div className="d-flex flex-column align-items-center text-muted fs-6">
            <p className="mb-0 mx-300px">
              {translate('We had some trouble loading this page.')}
              <br />
              {translate(
                'Please refresh the page or get in touch for support.',
              )}
            </p>
          </div>
        </div>
        <div className="d-flex gap-4">
          <Button variant="outline" className="btn-outline-default w-175px">
            {translate('Contact support')}
          </Button>
          <Button className="w-175px" onClick={() => location.reload()}>
            {translate('Refresh page')}
          </Button>
        </div>
      </div>
    </div>
  );
};
