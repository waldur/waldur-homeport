import { ShieldWarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FunctionComponent, memo, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { chatMessagesList, Message, ThreadSession } from 'waldur-js-client';

import { VersionSelector } from '@waldur/ai-assistant/components/shared/VersionSelector';
import { Badge } from '@waldur/core/Badge';
import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDateTime, formatShortDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getSeverityBadgeVariant } from '@waldur/support/SupportAIAssistantLogsList';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

interface MessageWithVersions {
  current: Message;
  versions: Message[]; // ordered oldest → newest, last element = current
}

const MessageItem: FunctionComponent<{ messageGroup: MessageWithVersions }> = ({
  messageGroup,
}) => {
  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  // Start with the latest version selected
  const lastIndex = messageGroup.versions.length - 1;
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(lastIndex);
  const clampedIndex = Math.min(selectedVersionIndex, lastIndex);
  const selectedMessage = messageGroup.versions[clampedIndex];

  if (!selectedMessage) return null;

  const isAssistant = selectedMessage.role === 'assistant';
  const isViewingHistory = clampedIndex < messageGroup.versions.length - 1;
  const hasVersions = messageGroup.versions.length > 1;
  const hasHistoricalFlag = useMemo(
    () =>
      !selectedMessage.is_flagged &&
      messageGroup.versions.slice(0, -1).some((v) => v.is_flagged),
    [selectedMessage.is_flagged, messageGroup.versions],
  );

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-2">
        <Badge variant="primary" size="sm" outline>
          {isAssistant ? translate('Assistant') : translate('User')}
        </Badge>
        <span className="text-muted small">
          {(isSm ? formatShortDateTime : formatDateTime)(
            selectedMessage.created,
          )}
        </span>
        {selectedMessage.is_flagged && (
          <Badge
            variant={getSeverityBadgeVariant(
              selectedMessage.injection_severity,
            )}
            size="sm"
            leftIcon={<ShieldWarningIcon weight="bold" />}
            outline
          >
            {selectedMessage.injection_severity}
          </Badge>
        )}
        {hasHistoricalFlag && (
          <Tip
            id={`historical-flag-${messageGroup.current.uuid}`}
            label={translate(
              'A previous version of this message was flagged for prompt injection',
            )}
          >
            <Badge
              variant="secondary"
              size="sm"
              leftIcon={<ShieldWarningIcon weight="bold" />}
              outline
            >
              {translate('Flagged in history')}
            </Badge>
          </Tip>
        )}
        {isViewingHistory && (
          <Badge variant="warning" size="sm" outline>
            {translate('Past version')}
          </Badge>
        )}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {hasVersions && (
            <VersionSelector
              displayLabel={translate('Version {current} / {total}', {
                current: clampedIndex + 1,
                total: messageGroup.versions.length,
              })}
              isViewingHistory={isViewingHistory}
              canGoPrevious={clampedIndex > 0}
              canGoNext={clampedIndex < messageGroup.versions.length - 1}
              onPrevious={() => setSelectedVersionIndex((prev) => prev - 1)}
              onNext={() => setSelectedVersionIndex((prev) => prev + 1)}
            />
          )}
          <CopyToClipboardButton
            value={selectedMessage.content}
            verbose={translate('Message')}
            onlyButton
            size={14}
          />
        </div>
      </div>
      <div
        className={classNames('p-3 rounded chat-log-bubble', {
          'border-start border-3 border-danger': selectedMessage.is_flagged,
        })}
      >
        <span style={{ whiteSpace: 'pre-wrap' }}>
          {selectedMessage.content.trim()}
        </span>
      </div>
    </div>
  );
};

interface OwnProps {
  row: ThreadSession;
  fetch?: (force?: boolean) => void;
}

export const SupportAIAssistantLogsExpandableRow: FunctionComponent<OwnProps> =
  memo(
    ({ row }) => {
      // Fetch all messages (including history) in a single request
      const { data: allMessages, isLoading } = useQuery({
        queryKey: ['chatMessages', row.uuid, row.modified],
        queryFn: async () => {
          const response = await chatMessagesList({
            query: { thread: row.uuid, include_history: true },
          });
          return response.error ? [] : response.data;
        },
      });

      // Group messages by sequence_index to build MessageWithVersions[]
      const processedMessages: MessageWithVersions[] = useMemo(() => {
        if (!allMessages?.length) return [];

        // Group by sequence_index, sort within group by created (oldest first)
        const groups = new Map<number, Message[]>();
        for (const msg of allMessages) {
          const key = msg.sequence_index;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(msg);
        }

        return Array.from(groups.entries())
          .sort(([a], [b]) => a - b)
          .map(([, versions]) => {
            const sorted = versions.sort(
              (a, b) =>
                new Date(a.created).getTime() - new Date(b.created).getTime(),
            );
            return { current: sorted[sorted.length - 1], versions: sorted };
          });
      }, [allMessages]);

      if (isLoading) {
        return <LoadingSpinner />;
      }

      if (!allMessages || allMessages.length === 0) {
        return (
          <ExpandableContainer>
            <span className="text-muted">
              {translate('No messages in this thread.')}
            </span>
          </ExpandableContainer>
        );
      }

      return (
        <ExpandableContainer>
          <div className="d-flex flex-column gap-3">
            {processedMessages.map((messageGroup) => (
              <MessageItem
                key={messageGroup.current.uuid}
                messageGroup={messageGroup}
              />
            ))}
          </div>
        </ExpandableContainer>
      );
    },
    (prev, next) =>
      prev.row.uuid === next.row.uuid &&
      prev.row.modified === next.row.modified,
  );
