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
  /** The call requires the results' adoption and none is recorded yet. */
  awaitingAdoption?: boolean;
}> = ({ state, heldDecisionsCount, awaitingAdoption }) => {
  const lifecycle = getRoundLifecycleState(state);
  if (!lifecycle) return null;
  return (
    <>
      <StateIndicator
        label={lifecycle.label}
        variant={lifecycle.color}
        tone="outline"
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
      {awaitingAdoption && state === 'deciding' ? (
        <StateIndicator
          label={translate('Awaiting adoption')}
          tooltip={translate(
            'The results are published once their adoption is recorded.',
          )}
          variant="info"
          tone="outline"
          shape="pill"
          data-testid="round-awaiting-adoption-badge"
        />
      ) : null}
    </>
  );
};
