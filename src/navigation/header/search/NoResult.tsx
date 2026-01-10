import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC, ReactNode } from 'react';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { RadialBg } from './RadialBg';

import './NoResult.scss';

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
  return (
    <div
      className={classNames(
        'search-no-result',
        !isVisible && 'd-none',
        className,
      )}
      style={style}
    >
      <RadialBg className="background" />
      <div className="text-center d-flex flex-column align-items-center pb-10 position-relative z-index-1">
        <div className="icon-square icon-lg search-icon">
          <MagnifyingGlassIcon weight="bold" size={24} />
        </div>

        <div>
          <h4>{title}</h4>
          <div className="d-flex flex-column align-items-center text-tertiary fs-6">
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
          <div className="actions d-flex justify-content-center gap-4 w-100">
            {Boolean(callback) && (
              <SubmitButton
                submitting={false}
                type="button"
                variant="tertiary"
                className={classNames(
                  'mw-175px min-w-120px',
                  actions ? 'w-175px' : 'w-50',
                )}
                onClick={callback}
                label={buttonTitle}
              />
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
