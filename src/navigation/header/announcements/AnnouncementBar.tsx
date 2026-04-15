import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import Markdown from 'markdown-to-jsx';
import { FC, ReactNode, useMemo } from 'react';
import { Variant } from 'react-bootstrap/types';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';

import { useTextTruncation } from './useTextTruncation';

const decodeHtmlEntities = (value: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

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
  const decodedDescription = useMemo(
    () => decodeHtmlEntities(description),
    [description],
  );

  const safeDescription = useMemo(
    () => DOMPurify.sanitize(decodedDescription),
    [decodedDescription],
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

          <Markdown
            options={{ forceInline: true }}
            className={variant && colored ? undefined : 'text-muted'}
          >
            {safeDescription}
          </Markdown>
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
