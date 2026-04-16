import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import { Variant } from 'react-bootstrap/types';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { parseMarkdownLinksOnly } from '@waldur/core/sanitize';
import { translate } from '@waldur/i18n';

import { useTextTruncation } from './useTextTruncation';

interface AnnouncementBarProps {
  icon: Icon;
  variant: Variant;
  label: ReactNode;
  description: string;
  onShowMore?: () => void;
  ellipsis?: boolean;
  colored?: boolean;
  hasColon?: boolean;
}

export const AnnouncementBar: FC<AnnouncementBarProps> = ({
  label,
  description,
  onShowMore,
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
          <strong className="fw-bold">
            {label}
            {hasColon ? ': ' : ' '}
          </strong>

          <span
            className={variant && colored ? undefined : 'text-muted'}
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>
        {showMoreButton && (
          <button
            type="button"
            className="text-anchor flex-shrink-0"
            onClick={onShowMore}
            aria-label={`Show more details for ${label}`}
          >
            {translate('Show more')}
          </button>
        )}
      </div>
    </div>
  );
};
