import { MagnifyingGlass } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import './NoResult.scss';

import Bg from './Background.svg';

interface NoResultProps {
  title?: string;
  message?: ReactNode;
  buttonTitle?: string;
  callback?(): void;
  isVisible?: boolean;
  style?: CSSProperties;
}

export const NoResult: FC<NoResultProps> = ({
  title = translate('No results found'),
  message = '',
  buttonTitle = translate('Clear search'),
  callback,
  isVisible = true,
  style,
}) => {
  return (
    <div
      className={classNames('search-no-result', !isVisible && 'd-none')}
      style={style}
    >
      <Bg className="background" />
      <div className="text-center d-flex flex-column align-items-center gap-6 pb-10 position-relative z-index-1">
        <div className="search-icon">
          <MagnifyingGlass size={25} />
        </div>

        <div>
          <h4 className="fw-bold mb-2">{title}</h4>
          <div className="d-flex flex-column align-items-center text-muted fs-6">
            {message !== null &&
              (message || (
                <p className="mb-0">
                  {translate("We didn't get any results.")}
                  <br />
                  {translate('Please try again')}
                </p>
              ))}
          </div>
        </div>
        {callback && (
          <Button
            variant="outline"
            className="btn-outline-default w-50 mw-350px"
            onClick={callback}
          >
            {buttonTitle}
          </Button>
        )}
      </div>
    </div>
  );
};
