import { FC } from 'react';
import { LifecycleStateEnum } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { getRoundLifecycleState } from '@/proposals/roundLifecycle';

/** The round's post-cut-off stage, shown beside its status; nothing before. */
export const RoundLifecycleBadge: FC<{
  state: LifecycleStateEnum | null | undefined;
  /** Only on the protected round, i.e. for the call team. */
  heldDecisionsCount?: number | null;
}> = ({ state, heldDecisionsCount }) => {
  const lifecycle = getRoundLifecycleState(state);
  if (!lifecycle) return null;
  return (
    <>
      <StateIndicator
        label={lifecycle.label}
        variant={lifecycle.color}
        tone="light"
        shape="pill"
        data-testid="round-lifecycle-badge"
      />
      {heldDecisionsCount ? (
        <StateIndicator
          label={translate('{count} held', { count: heldDecisionsCount })}
          tooltip={translate(
            '{count} decision(s) waiting to be released when the round publishes its results',
            { count: heldDecisionsCount },
          )}
          variant="warning"
          tone="outline"
          shape="pill"
          data-testid="round-held-decisions-badge"
        />
      ) : null}
    </>
  );
};
