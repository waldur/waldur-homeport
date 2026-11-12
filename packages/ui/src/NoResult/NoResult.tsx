import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { CSSProperties, FC, ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../Button';
import { RadialBackground } from '../Dialog';
import { IconSquare } from '../IconSquare';

import {
  STATE_BACKGROUND_CLASSNAME,
  STATE_ICON_CLASSNAME,
  STATE_ROOT_CLASSNAME,
  STATE_TITLE_CLASSNAME,
} from './styles';

export interface NoResultProps {
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
      data-slot="no-result"
      className={clsx(STATE_ROOT_CLASSNAME, !isVisible && 'hidden', className)}
      style={style}
    >
      <RadialBackground className={STATE_BACKGROUND_CLASSNAME} />
      <div className="text-center flex flex-col items-center pb-8 relative z-1">
        <IconSquare size="lg" className={STATE_ICON_CLASSNAME}>
          {icon}
        </IconSquare>

        <div>
          <h4 className={STATE_TITLE_CLASSNAME}>{title}</h4>
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
          <div className="mt-6 flex w-full justify-center gap-3">
            {Boolean(callback) && (
              <BaseButton
                variant="tertiary"
                className={clsx(
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
