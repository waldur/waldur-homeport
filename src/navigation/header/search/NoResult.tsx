import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTheme } from '@waldur/theme/useTheme';

import './NoResult.scss';

import Bg from './Background.svg';
import BgDark from './BackgroundDark.svg';

interface NoResultProps {
  title?: string;
  message?: ReactNode;
  actions?: ReactNode;
  buttonTitle?: string;
  callback?(): void;
  isVisible?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const NoResult: FC<NoResultProps> = ({
  title = translate('No results found'),
  message = '',
  actions,
  buttonTitle = translate('Clear search'),
  callback,
  isVisible = true,
  className,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={classNames(
        'search-no-result',
        !isVisible && 'd-none',
        className,
      )}
      style={style}
    >
      {theme === 'dark' ? (
        <BgDark className="background" />
      ) : (
        <Bg className="background" />
      )}
      <div className="text-center d-flex flex-column align-items-center gap-6 pb-10 position-relative z-index-1">
        <div className="search-icon">
          <MagnifyingGlassIcon weight="bold" size={24} />
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
        {(actions || callback) && (
          <div className="d-flex justify-content-center gap-4 w-100">
            {Boolean(callback) && (
              <Button
                variant="outline"
                className={classNames(
                  'btn-outline-default mw-350px',
                  actions ? 'w-175px' : 'w-50',
                )}
                onClick={callback}
              >
                {buttonTitle}
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
