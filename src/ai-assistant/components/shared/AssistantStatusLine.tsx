import { LightbulbIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { cn, LoadingSpinner } from 'waldur-ui';

import { SHIMMER, STATUS_ROW } from './statusStyles';

interface AssistantStatusLineProps {
  label: string;
  // A tool is running: a spinner instead of the thinking icon.
  working?: boolean;
}

// The one indicator an assistant reply shows while there is nothing else to
// show. It changes its text in place rather than swapping indicators. The
// caller's live region announces it, so screen readers skip this copy.
export const AssistantStatusLine: FC<AssistantStatusLineProps> = ({
  label,
  working,
}) => (
  <div className={STATUS_ROW} aria-hidden="true">
    {working ? (
      <LoadingSpinner
        size={14}
        className="shrink-0 motion-reduce:animate-none"
        aria-hidden="true"
      />
    ) : (
      <LightbulbIcon className="shrink-0" weight="bold" aria-hidden="true" />
    )}
    <span className={cn(SHIMMER, 'min-w-0 truncate')}>{label}</span>
  </div>
);
