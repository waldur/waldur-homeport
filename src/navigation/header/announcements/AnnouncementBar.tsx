import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';

import { BaseButton, FeaturedIcon, FeaturedIconVariant } from 'waldur-ui';

import { parseMarkdownLinksOnly } from '@/core/sanitize';
import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

import { useTextTruncation } from './useTextTruncation';

interface AnnouncementBarProps {
  icon: Icon;
  /** With `colored`, also tints the bar — only success/warning/danger have a
   * tint (COLORED_CLASSES); `info`/`neutral`/`primary` still colour the icon
   * via FeaturedIcon but render on the plain page background, same as
   * `colored: false`. */
  variant: FeaturedIconVariant;
  /** Inline label used by non-announcement bars (offering/order/resource). */
  label?: ReactNode;
  /** Announcement title (e.g. the maintenance name), shown in title styling. */
  title?: ReactNode;
  /** Issuing service provider, appended to the title as "by {provider}". */
  provider?: string;
  description: string;
  onShowMore?: () => void;
  actionLabel?: ReactNode;
  onAction?: () => void;
  /** A second action, shown before the first. */
  secondaryActionLabel?: ReactNode;
  onSecondaryAction?: () => void;
  ellipsis?: boolean;
  colored?: boolean;
  hasColon?: boolean;
}

// Each bar is one row of a flush stack: a single bottom border divides
// adjacent bars, with no gaps and no doubled borders.
const BAR_CLASSES =
  'flex min-h-[55px] items-center border-b border-secondary print:hidden';

const COLORED_CLASSES: Partial<Record<FeaturedIconVariant, string>> = {
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
};

export const AnnouncementBar: FC<AnnouncementBarProps> = ({
  label,
  title,
  provider,
  description,
  onShowMore,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  variant,
  ellipsis,
  colored,
  hasColon,
}) => {
  const IconComponent = icon;
  const { textRef, isTruncated } = useTextTruncation();
  const safeDescription = useMemo(
    () => parseMarkdownLinksOnly(description),
    [description],
  );

  const showMoreButton = onShowMore && isTruncated;
  const colorClass = colored ? COLORED_CLASSES[variant] : undefined;
  const messageClass = colored ? undefined : 'text-quaternary';

  return (
    <div
      className={classNames(BAR_CLASSES, colorClass ?? 'bg-primary')}
      data-variant={variant}
    >
      <div
        className={classNames(
          PAGE_CONTAINER_CLASSNAME,
          'flex w-full items-center gap-[6.5px] py-[6.5px]',
          ellipsis && 'truncate',
        )}
      >
        <FeaturedIcon
          icon={<IconComponent weight="bold" />}
          variant={variant}
        />

        <div
          ref={textRef}
          className={classNames('text-start text-sm', ellipsis && 'truncate')}
        >
          {label ? (
            <strong className="font-medium">
              {label}
              {hasColon ? ': ' : ' '}
            </strong>
          ) : (
            // One line: bold title (the "what"), then the provider as a muted
            // "by … :" byline (the "who"), then the body message.
            <>
              {title ? (
                <strong className="font-semibold">{title}. </strong>
              ) : null}
              {provider ? (
                <span className={messageClass}>
                  {translate('By {provider}', { provider })}:{' '}
                </span>
              ) : null}
            </>
          )}
          <span
            className={messageClass}
            dangerouslySetInnerHTML={{ __html: safeDescription }}
            data-testid="announcement-description"
          />
        </div>
        {onSecondaryAction && secondaryActionLabel ? (
          <BaseButton
            variant="tertiary"
            size="sm"
            className="ms-auto shrink-0"
            onClick={onSecondaryAction}
            label={secondaryActionLabel}
          />
        ) : null}
        {onAction && actionLabel ? (
          <BaseButton
            variant="tertiary"
            size="sm"
            className={classNames(
              'shrink-0',
              !(onSecondaryAction && secondaryActionLabel) && 'ms-auto',
            )}
            onClick={onAction}
            label={actionLabel}
          />
        ) : null}
        {showMoreButton && (
          <button
            type="button"
            className="shrink-0 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-sm text-[var(--text-brand-secondary)] hover:underline"
            onClick={onShowMore}
            aria-label={
              label || title
                ? `Show more details for ${label || title}`
                : translate('Show more')
            }
          >
            {translate('Show more')}
          </button>
        )}
      </div>
    </div>
  );
};
