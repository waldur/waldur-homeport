import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC, ReactNode } from 'react';

import { BaseButton, RadialBackground } from 'waldur-ui';

import { translate } from '@/i18n';

import './NoResult.scss';

interface NoResultProps {
  title?: string;
  message?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  buttonTitle?: string;
  // Explicitly marks this empty state as having no actionable CTA.
  noAction?: boolean;
  callback?(): void;
  isVisible?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const NoResult: FC<NoResultProps> = ({
  title = translate('No results found'),
  message = '',
  icon = <MagnifyingGlassIcon weight="bold" size={24} />,
  actions,
  buttonTitle = translate('Clear search'),
  callback,
  isVisible = true,
  className,
  style,
}: NoResultProps) => {
  return (
    <div
      className={classNames(
        'search-no-result',
        !isVisible && 'hidden',
        className,
      )}
      style={style}
    >
      <RadialBackground className="background" />
      <div className="text-center flex flex-col items-center pb-10 position-relative z-index-1">
        <div className="icon-square icon-lg search-icon">{icon}</div>

        <div>
          <h4>{title}</h4>
          <div className="flex flex-col items-center text-quaternary text-sm">
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
          <div className="actions flex justify-center gap-4 w-full">
            {Boolean(callback) && (
              <BaseButton
                variant="tertiary"
                className={classNames(
                  'max-w-[175px] min-w-[120px]',
                  actions ? 'w-[175px]' : 'w-1/2',
                )}
                onClick={callback}
                label={buttonTitle}
                size="lg"
              />
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
