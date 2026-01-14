import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import { Variant } from 'react-bootstrap/types';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';

import { useTextTruncation } from './useTextTruncation';

// Simple function to strip markdown and convert to plain text for truncated display
const stripMarkdown = (markdown: string): string => {
  return (
    markdown
      // Remove headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove code blocks and inline code
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Replace multiple whitespace with single space
      .replace(/\s+/g, ' ')
      // Remove line breaks for single line display
      .replace(/\n/g, ' ')
      .trim()
  );
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

  // Convert markdown to plain text for single-line display
  const plainTextDescription = useMemo(
    () => stripMarkdown(description),
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

        <p
          ref={textRef}
          className={classNames('text-start fs-6', ellipsis && 'ellipsis')}
        >
          <strong className="fw-bold">
            {label}
            {hasColon ? ': ' : ' '}
          </strong>
          <span className={variant && colored ? undefined : 'text-muted'}>
            {plainTextDescription}
          </span>
        </p>
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
