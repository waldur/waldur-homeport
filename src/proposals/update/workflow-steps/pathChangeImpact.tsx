import { ArrowRightIcon } from '@phosphor-icons/react';
import { Fragment, ReactNode, useCallback } from 'react';
import { proposalProposalsList } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { sortByOrder, stepName } from '@/proposals/workflow/constants';

/** The fields of a step the path is drawn from. */
export interface PathStep {
  uuid: string;
  order: number;
  is_enabled?: boolean;
  name?: string | null;
  key?: string | null;
}

export interface PathChange {
  // 'order' for a move; 'steps' for a step added, enabled, disabled or removed.
  kind: 'order' | 'steps';
  before: PathStep[];
  after: PathStep[];
  // The step the change is about, highlighted in the sequences.
  changedUuid: string;
}

export interface RoundImpact {
  round_uuid: string;
  round_name: string;
  count: number;
}

/**
 * The path a proposal submitted now would walk: the enabled steps, in order.
 * A proposal copies it on submission, so it is what a change here alters.
 */
const getPath = (steps: PathStep[]): PathStep[] =>
  sortByOrder(steps.filter((s) => s.is_enabled !== false));

export const isPathChanged = (change: PathChange): boolean => {
  const before = getPath(change.before).map((s) => s.uuid);
  const after = getPath(change.after).map((s) => s.uuid);
  return (
    before.length !== after.length || before.some((u, i) => u !== after[i])
  );
};

/** The steps as they would stand after moving `uuid` one place. */
export const swapWithNeighbour = <T extends PathStep>(
  steps: T[],
  uuid: string,
  direction: 'up' | 'down',
): T[] => {
  const sorted = sortByOrder(steps);
  const index = sorted.findIndex((s) => s.uuid === uuid);
  const other = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || other < 0 || other >= sorted.length) return sorted;
  const result = [...sorted];
  [result[index], result[other]] = [result[other], result[index]];
  // Re-number so the result sorts the way it reads.
  return result.map((s, i) => ({ ...s, order: i }));
};

/**
 * Rounds whose proposals may follow two different paths: still taking
 * submissions, or being evaluated right after the cut-off.
 */
export const getRoundsAtRisk = (call: Pick<Call, 'rounds'>) =>
  (call.rounds ?? []).filter(
    (round) =>
      round.status === 'open' || round.lifecycle_state === 'evaluating',
  );

/**
 * How many proposals of each such round have already been submitted, and so
 * keep the path they were submitted with. Rounds without any are left out.
 */
const fetchSubmittedByRoundAtRisk = async (
  call: Pick<Call, 'rounds'>,
): Promise<RoundImpact[]> => {
  const rounds = getRoundsAtRisk(call);
  const counts = await Promise.all(
    rounds.map((round) =>
      proposalProposalsList({
        query: {
          round_uuid: round.uuid,
          state: ['submitted', 'in_review'],
          page: 1,
          page_size: 1,
        },
      }).then(fetchResultCount),
    ),
  );
  return rounds
    .map((round, index) => ({
      round_uuid: round.uuid,
      round_name: round.name,
      count: counts[index] || 0,
    }))
    .filter((impact) => impact.count > 0);
};

const quoted = (name: string) => <strong>&lsquo;{name}&rsquo;</strong>;

const proposalsLabel = (count: number) =>
  count === 1
    ? translate('1 proposal')
    : translate('{count} proposals', { count });

/** "3 proposals already submitted in round 'X' (and 1 in 'Y') keep ..." */
const ImpactSentence = ({
  impact,
  kind,
}: {
  impact: RoundImpact[];
  kind: PathChange['kind'];
}) => {
  const [first, ...rest] = impact;
  const total = impact.reduce((sum, r) => sum + r.count, 0);
  const others = rest.length ? (
    <>
      {' ('}
      {translate('and')}{' '}
      {rest.map((r, i) => (
        <Fragment key={r.round_uuid}>
          {i > 0 && ', '}
          {translate(
            '{count} in {round}',
            { count: r.count, round: quoted(r.round_name) },
            formatJsxTemplate,
          )}
        </Fragment>
      ))}
      )
    </>
  ) : null;
  const vars = {
    proposals: proposalsLabel(first.count),
    round: quoted(first.round_name),
    others,
  };
  if (kind === 'order') {
    return total === 1
      ? translate(
          '{proposals} already submitted in round {round}{others} keeps the current order.',
          vars,
          formatJsxTemplate,
        )
      : translate(
          '{proposals} already submitted in round {round}{others} keep the current order.',
          vars,
          formatJsxTemplate,
        );
  }
  return total === 1
    ? translate(
        '{proposals} already submitted in round {round}{others} keeps the current steps.',
        vars,
        formatJsxTemplate,
      )
    : translate(
        '{proposals} already submitted in round {round}{others} keep the current steps.',
        vars,
        formatJsxTemplate,
      );
};

const Sequence = ({
  steps,
  highlightUuid,
  removed,
}: {
  steps: PathStep[];
  highlightUuid?: string;
  removed?: boolean;
}) => {
  const path = getPath(steps);
  if (!path.length) return <span className="text-quaternary">&mdash;</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {path.map((step, index) => (
        <Fragment key={step.uuid}>
          {index > 0 && (
            <ArrowRightIcon
              weight="bold"
              size={12}
              className="text-quaternary"
              aria-hidden
            />
          )}
          {step.uuid === highlightUuid ? (
            <Badge
              variant={removed ? 'danger' : 'primary'}
              tone="outline"
              data-testid="changed-step"
              className={removed ? 'line-through' : undefined}
            >
              {stepName(step)}
            </Badge>
          ) : (
            <span>{stepName(step)}</span>
          )}
        </Fragment>
      ))}
    </span>
  );
};

/** What the dialog says: who keeps the old path, and the path before and after. */
const PathChangeImpact = ({
  change,
  impact,
}: {
  change: PathChange;
  impact: RoundImpact[];
}) => {
  const inBefore = getPath(change.before).some(
    (s) => s.uuid === change.changedUuid,
  );
  const inAfter = getPath(change.after).some(
    (s) => s.uuid === change.changedUuid,
  );
  return (
    <div className="flex flex-col gap-2.5 text-start">
      <p className="mb-0" data-testid="path-change-impact">
        <ImpactSentence impact={impact} kind={change.kind} />{' '}
        {change.kind === 'order'
          ? translate('Proposals submitted from now on follow the new order.')
          : translate('Proposals submitted from now on follow the new steps.')}
      </p>
      <div className="flex flex-col gap-1.5 text-xs">
        <div data-testid="path-before">
          <div className="text-quaternary font-semibold mb-1">
            {translate('Current sequence')}
          </div>
          <Sequence
            steps={change.before}
            highlightUuid={inBefore ? change.changedUuid : undefined}
            removed={!inAfter}
          />
        </div>
        <div data-testid="path-after">
          <div className="text-quaternary font-semibold mb-1">
            {translate('New sequence')}
          </div>
          <Sequence
            steps={change.after}
            highlightUuid={inAfter ? change.changedUuid : undefined}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Asks before a change that alters the path of proposals submitted from now
 * on, while proposals already submitted to a round still in progress keep
 * the old one. Resolves true when the change may go ahead: confirmed, or
 * nobody is affected. A change that leaves the path as it is goes ahead
 * without asking.
 *
 * `prompt` goes above the impact when the change needs confirming anyway
 * (removing a step); such a change is always confirmed.
 */
export const useConfirmPathChange = (call: Pick<Call, 'rounds'>) => {
  const { confirm } = useModal();
  return useCallback(
    async (
      change: PathChange,
      options: {
        title?: string;
        prompt?: ReactNode;
        forDeletion?: boolean;
      } = {},
    ): Promise<boolean> => {
      let impact: RoundImpact[] = [];
      if (isPathChanged(change) && getRoundsAtRisk(call).length) {
        try {
          impact = await fetchSubmittedByRoundAtRisk(call);
        } catch {
          // Counts unavailable: the change goes on as it would without them,
          // the backend still refusing what it cannot take.
          impact = [];
        }
      }
      if (!impact.length && !options.prompt) return true;
      try {
        await confirm(
          options.title ??
            (change.kind === 'order'
              ? translate('Change the order of steps?')
              : translate('Change the steps?')),
          <div className="flex flex-col gap-2.5 text-start">
            {options.prompt}
            {impact.length ? (
              <PathChangeImpact change={change} impact={impact} />
            ) : null}
          </div>,
          {
            size: impact.length ? 'md' : undefined,
            forDeletion: options.forDeletion,
            positiveButton: options.forDeletion
              ? undefined
              : translate('Confirm'),
            negativeButton: options.forDeletion
              ? undefined
              : translate('Cancel'),
          },
        );
        return true;
      } catch {
        return false;
      }
    },
    [call, confirm],
  );
};
