import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';

import { RemoveFilterBadgeButton } from './RemoveFilterBadgeButton';

export interface TagProps {
  onClear?(e: MouseEvent<any>): void;
  /**
   * Accessible name of the remove button, e.g. "Remove Finland". Defaults to
   * "Remove {value}" when the tag's content is plain text, else "Remove".
   */
  clearLabel?: string;
  onClick?(e: MouseEvent<any>): void;
  size?: 'sm' | 'lg';
  className?: string;
}

export const Tag = forwardRef<HTMLSpanElement, PropsWithChildren<TagProps>>(
  ({ children, onClear, clearLabel, onClick, size, className }, ref) => (
    <span
      ref={ref}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'tag inline-flex items-center gap-1 rounded-md border-[1px] border-primary bg-primary text-secondary px-2',
        size === 'sm' && 'tag-sm py-[1px] text-xs leading-[18px]',
        size === 'lg' && 'tag-lg py-[3px] text-sm leading-5',
        !size && 'py-[1px] text-sm leading-5',
        onClick && 'cursor-pointer select-none',
        className,
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLSpanElement>);
              }
            }
          : undefined
      }
    >
      {children}
      {!!onClear && (
        <RemoveFilterBadgeButton
          size={size === 'sm' ? 10 : 12}
          onClick={onClear}
          label={
            clearLabel ??
            (typeof children === 'string' || typeof children === 'number'
              ? translate('Remove {value}', { value: children })
              : translate('Remove'))
          }
        />
      )}
    </span>
  ),
);
