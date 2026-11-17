import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import {
  Avatar,
  Badge,
  cn,
  TimelineContent,
  TimelineIcon,
  TimelineItem,
} from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

import { formatPolicyComment, isPolicyComment } from './utils';

interface VersionHistoryItemProps {
  version: VersionHistory;
  isSelected: boolean;
  onSelect: () => void;
  versionIndex: number;
  totalVersions: number;
}

const VersionAvatar: FunctionComponent<{
  userName: string;
}> = ({ userName }) => {
  // Decorative: the name is spelled out beside it.
  return (
    <TimelineIcon aria-hidden="true">
      <Avatar name={userName} size={32} className="border border-secondary" />
    </TimelineIcon>
  );
};

export const VersionHistoryItem: FunctionComponent<VersionHistoryItemProps> = ({
  version,
  isSelected,
  onSelect,
  versionIndex,
  totalVersions,
}) => {
  const userName =
    (version.revision_user as { full_name?: string })?.full_name ||
    (version.revision_user as { username?: string })?.username ||
    translate('System');

  const versionLabel =
    versionIndex === 0
      ? translate('Current')
      : versionIndex === totalVersions - 1
        ? translate('Initial')
        : `v${totalVersions - versionIndex}`;

  // On the dark selected fill, quaternary text steps up to the subdued tone
  // so it remains readable.
  const mutedText = isSelected
    ? 'text-quaternary dark:text-tertiary'
    : 'text-quaternary';

  // A list item holding a native button: the button is what is announced and
  // focused, and its ::after, stretched over the row, makes the whole row its
  // click target. The selected revision is the one the diff shows, hence
  // aria-current. Button content must be phrasing content, so the text blocks
  // are spans.
  return (
    <TimelineItem
      isSelected={isSelected}
      className={cn(
        // Full-width selectable rows, as in the Add resource categories list.
        'px-6 py-3 border-b border-b-secondary transition-colors',
        isSelected ? 'bg-tertiary' : 'hover:bg-secondary',
        'has-[>button:focus-visible]:outline-[var(--focus-ring-width)] has-[>button:focus-visible]:outline-[var(--focus-ring-color)] has-[>button:focus-visible]:outline-offset-[calc(var(--focus-ring-width)*-1)] has-[>button:focus-visible]:outline-solid',
      )}
    >
      <VersionAvatar userName={userName} />
      <TimelineContent asChild>
        <button
          type="button"
          className="after:absolute after:inset-0 after:z-1 block w-full p-0 border-0 bg-transparent text-left text-inherit focus-visible:outline-none"
          aria-current={isSelected || undefined}
          onClick={onSelect}
        >
          <span className="flex justify-between items-start gap-2">
            <span className="block grow min-w-0">
              <span className={cn('block text-xs', mutedText)}>
                <span className="font-medium text-sm mr-3">{userName}</span>
                {isPolicyComment(version.revision_comment) && (
                  <Badge
                    variant="neutral"
                    size="sm"
                    leftIcon={<ShieldWarningIcon weight="bold" />}
                    shape="pill"
                    tone="outline"
                    className="mr-2"
                  >
                    {translate('Policy')}
                  </Badge>
                )}
                <time
                  className="whitespace-nowrap"
                  dateTime={version.revision_date}
                  title={formatMediumDateTime(version.revision_date)}
                >
                  {formatRelative(version.revision_date)}
                </time>
              </span>
              {version.revision_comment && (
                <span
                  className={cn('block text-xs mt-1 break-words', mutedText)}
                >
                  {isPolicyComment(version.revision_comment)
                    ? formatPolicyComment(version.revision_comment)
                    : version.revision_comment}
                </span>
              )}
            </span>
            <StateIndicator
              label={versionLabel}
              variant={versionIndex === 0 ? 'success' : 'neutral'}
              tone="outline"
              shape="pill"
            />
          </span>
        </button>
      </TimelineContent>
    </TimelineItem>
  );
};
