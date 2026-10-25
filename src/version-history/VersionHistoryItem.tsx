import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import {
  Badge,
  cn,
  TimelineConnector,
  TimelineContent,
  TimelineIcon,
  TimelineItem,
} from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { getAbbreviation } from '@/core/utils';
import { translate } from '@/i18n';

import { formatPolicyComment, isPolicyComment } from './utils';

interface VersionHistoryItemProps {
  version: VersionHistory;
  isSelected: boolean;
  onSelect: () => void;
  versionIndex: number;
  totalVersions: number;
}

const nameToColor = (name: string) => {
  const colors = ['primary', 'success', 'info', 'warning', 'danger'] as const;
  const hash = hashStr(name);
  const index = (hash >>> 0) % colors.length;
  return colors[index] || 'primary';
};

const hashStr = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const AVATAR_COLOR_CLASSES: Record<string, string> = {
  primary: 'bg-brand-subtle text-brand',
  success: 'bg-success-subtle text-success',
  info: 'bg-info-subtle text-info',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
};

const VersionAvatar: FunctionComponent<{
  userName: string;
}> = ({ userName }) => {
  const color = nameToColor(userName);

  // Decorative: the name is spelled out beside it.
  return (
    <TimelineIcon aria-hidden="true">
      <div
        className={cn(
          'size-8 rounded-full flex items-center justify-center text-xs font-medium',
          AVATAR_COLOR_CLASSES[color] || AVATAR_COLOR_CLASSES.primary,
        )}
      >
        {getAbbreviation(userName)}
      </div>
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

  // Bootstrap's .text-muted is the same secondary tone, but !important, so
  // the selected row could not lift it: on the dark selected fill it reads
  // 4:1, so it steps up to the subdued tone there.
  const mutedText = isSelected
    ? 'text-quaternary dark:text-tertiary'
    : 'text-quaternary';

  // A list item holding a native button: the button is what is announced and
  // focused, and stretched-link makes the whole row its click target. The
  // selected revision is the one the diff shows, hence aria-current. Button
  // content must be phrasing content, so the text blocks are spans.
  return (
    <TimelineItem
      isSelected={isSelected}
      className={cn(
        'rounded transition-colors',
        isSelected ? 'bg-brand-subtle' : 'hover:bg-primary-hover',
        'has-[>button:focus-visible]:outline-[var(--focus-ring-width)] has-[>button:focus-visible]:outline-[var(--focus-ring-color)] has-[>button:focus-visible]:outline-offset-[var(--focus-ring-offset)] has-[>button:focus-visible]:outline-solid',
      )}
    >
      <TimelineConnector />
      <VersionAvatar userName={userName} />
      <TimelineContent asChild>
        <button
          type="button"
          className="stretched-link block w-full py-2 pr-3 border-0 bg-transparent text-left text-inherit focus-visible:outline-none mb-0 pb-3"
          aria-current={isSelected || undefined}
          onClick={onSelect}
        >
          <span className="flex justify-between items-start">
            <span className="block grow min-w-0">
              <span className={cn('block text-xs', mutedText)}>
                <span className="font-medium text-sm mr-3">{userName}</span>
                {isPolicyComment(version.revision_comment) && (
                  <Badge
                    variant="warning"
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
              variant={versionIndex === 0 ? 'success' : 'secondary'}
              tone="outline"
              shape="pill"
            />
          </span>
        </button>
      </TimelineContent>
    </TimelineItem>
  );
};
