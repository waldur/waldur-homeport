import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import { Variant } from 'react-bootstrap/types';

import { FeaturedIcon } from '@/core/FeaturedIcon';
import { parseMarkdownLinksOnly } from '@/core/sanitize';
import { translate } from '@/i18n';

import { useTextTruncation } from './useTextTruncation';

interface AnnouncementBarProps {
  icon: Icon;
  variant: Variant;
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
  ellipsis?: boolean;
  colored?: boolean;
  hasColon?: boolean;
}

export const AnnouncementBar: FC<AnnouncementBarProps> = ({
  label,
  title,
  provider,
  description,
  onShowMore,
  actionLabel,
  onAction,
  icon,
  variant,
  ellipsis,
  colored,
  hasColon,
}) => {
  const { textRef, isTruncated } = useTextTruncation();
  const safeDescription = useMemo(
    () => parseMarkdownLinksOnly(description),
    [description],
  );

  const showMoreButton = onShowMore && isTruncated;
  const messageClass = variant && colored ? undefined : 'text-muted';

  return (
    <div
      className={classNames(
        'bar d-print-none',
        variant && colored ? `bar-${variant}` : 'bg-body',
      )}
    >
      <div
        className={classNames(
          'container-fluid w-100 d-flex align-items-center gap-2',
          ellipsis && 'ellipsis',
        )}
      >
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon IconComponent={icon} variant={variant} />

        <div
          ref={textRef}
          className={classNames('text-start fs-6 mb-0', ellipsis && 'ellipsis')}
        >
          {label ? (
            <strong className="fw-bold">
              {label}
              {hasColon ? ': ' : ' '}
            </strong>
          ) : (
            // One line: bold title (the "what"), then the provider as a muted
            // "by … :" byline (the "who"), then the body message.
            <>
              {title ? (
                <strong className="fw-semibold">{title}. </strong>
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
        {onAction && actionLabel ? (
          <button
            type="button"
            className="btn btn-sm btn-tertiary flex-shrink-0 ms-auto"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
        {showMoreButton && (
          <button
            type="button"
            className="text-anchor flex-shrink-0"
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
