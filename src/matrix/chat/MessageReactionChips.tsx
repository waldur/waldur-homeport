import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

import { ReactionAggregate } from './types';
import { useMatrixClient } from './useMatrixClient';
import { useReactions } from './useReactions';
import { useRoomMemberNames } from './useRoomMemberNames';
import { resolveMemberName } from './utils';

interface Props {
  eventId: string;
  reactions: ReactionAggregate[] | undefined;
  /**
   * Map from emoji key → list of reactor user_ids. Sourced from the same
   * timeline aggregateReactions consumed; passed in so the chip row doesn't
   * need to walk the timeline itself.
   */
  reactors: Record<string, string[]>;
}

export const MessageReactionChips: FC<Props> = ({
  eventId,
  reactions,
  reactors,
}) => {
  const { activeRoomUuid } = useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  const { react, unreact } = useReactions({ eventId, reactions });

  // Pre-compute the reactor name lists per key for the tooltip.
  const reactorTitles = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, ids] of Object.entries(reactors)) {
      const names = ids.map((id) => resolveMemberName(id, memberNames));
      out[key] = translate('Reacted: {names}', { names: names.join(', ') });
    }
    return out;
  }, [reactors, memberNames]);

  if (!reactions || reactions.length === 0) return null;

  return (
    <div
      className="tc-msg-reactions"
      role="group"
      aria-label={translate('Reactions')}
    >
      {reactions.map((r) => (
        <Tooltip key={r.key} label={reactorTitles[r.key]} side="bottom">
          <button
            type="button"
            aria-pressed={r.reactedByMe}
            aria-label={translate(
              '{count} {key} reactions — click to {verb} yours',
              {
                count: r.count,
                key: r.key,
                verb: r.reactedByMe ? translate('remove') : translate('add'),
              },
            )}
            onClick={() => (r.reactedByMe ? unreact(r.key) : react(r.key))}
            className={classNames('tc-msg-reactions__chip', {
              'is-mine': r.reactedByMe,
            })}
          >
            <span aria-hidden>{r.key}</span>
            <span className="tc-msg-reactions__count">{r.count}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
};
