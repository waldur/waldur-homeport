import { ListNumbersIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  AwardedResource,
  proposalProposalsAwardedResourcesDestroy,
  proposalProposalsAwardedResourcesPartialUpdate,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { awardedResourcesKey } from '@/proposals/awardedResources';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';

import {
  formatAmounts,
  getNamedRecommendation,
  getAwardPrefillPatches,
  getRecommendedResources,
  useProposalRanking,
} from './rankings';

interface OfferingNamed {
  requested_offering?: { uuid?: string; offering_name?: string } | null;
}

interface RankingRecommendationProps {
  proposalUuid: string;
  roundUuid: string | undefined;
  awards: AwardedResource[] | null | undefined;
  /** The requested items, which name an offering no longer awarded. */
  requests?: OfferingNamed[] | null;
  /** The call manager may change the award now. */
  editable: boolean;
}

/**
 * Where the committee placed the proposal in its round, and what it
 * recommends, beside the award; the call manager can prefill the awarded
 * amounts from the recommendation. Nothing for a viewer who may not read the
 * ranking, or a proposal not ranked.
 */
export const RankingRecommendation: FC<RankingRecommendationProps> = ({
  proposalUuid,
  roundUuid,
  awards,
  requests,
  editable,
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();
  const [prefilling, setPrefilling] = useState(false);
  const { data: ranking } = useProposalRanking(proposalUuid, roundUuid);
  const recommended = useMemo(
    () => getRecommendedResources(ranking),
    [ranking],
  );
  const patches = useMemo(
    () => getAwardPrefillPatches(awards ?? [], recommended),
    [awards, recommended],
  );
  if (!ranking) {
    return null;
  }
  const offeringNames = Object.fromEntries(
    [...(requests ?? []), ...(awards ?? [])].map((item: OfferingNamed) => [
      item.requested_offering?.uuid,
      item.requested_offering?.offering_name,
    ]),
  );
  const entries = Object.entries(recommended);

  // One request per award item, as there is no endpoint changing several:
  // each is tried, and a partial failure names what was and was not saved.
  const prefill = async () => {
    setPrefilling(true);
    const saved: string[] = [];
    const failed: string[] = [];
    let firstError: unknown;
    for (const patch of patches) {
      const offeringUuid = patch.awarded.requested_offering?.uuid;
      const name =
        (offeringUuid && offeringNames[offeringUuid]) ||
        offeringUuid ||
        patch.awarded.uuid;
      try {
        if (patch.remove) {
          await proposalProposalsAwardedResourcesDestroy({
            path: { uuid: proposalUuid, obj_uuid: patch.awarded.uuid },
          });
        } else {
          await proposalProposalsAwardedResourcesPartialUpdate({
            path: { uuid: proposalUuid, obj_uuid: patch.awarded.uuid },
            body: { limits: patch.limits },
          });
        }
        saved.push(name);
      } catch (error) {
        failed.push(name);
        firstError ??= error;
      }
    }
    setPrefilling(false);
    await queryClient.invalidateQueries({
      queryKey: awardedResourcesKey(proposalUuid),
    });
    if (!failed.length) {
      showSuccess(
        translate('The award has been prefilled from the recommendation.'),
      );
    } else if (!saved.length) {
      showErrorResponse(
        firstError,
        translate('Unable to prefill the award; nothing was changed.'),
      );
    } else {
      showErrorResponse(
        firstError,
        translate(
          'The award was prefilled only in part. Saved: {saved}. Not saved: {failed}.',
          { saved: saved.join(', '), failed: failed.join(', ') },
        ),
      );
    }
  };

  // Component names rather than their keys, as the backend names them.
  const named = Object.fromEntries(
    getNamedRecommendation(ranking).map((entry) => [entry.uuid, entry]),
  );

  return (
    <div
      className="flex flex-wrap items-start justify-between gap-2.5 p-3 mb-3 rounded-lg bg-tertiary dark:bg-quaternary"
      data-testid="ranking-recommendation"
    >
      <div className="flex gap-2.5">
        <ListNumbersIcon size={24} weight="bold" className="text-primary" />
        <div>
          <div className="font-medium">
            {translate('Rank {rank} in round', { rank: ranking.rank })}
            {ranking.final_score !== null && ranking.final_score !== undefined
              ? ` · ${translate('final score {score}', { score: ranking.final_score })}`
              : null}
          </div>
          <div className="text-quaternary">
            {entries.length
              ? entries.map(([offeringUuid, amounts]) => (
                  <div key={offeringUuid}>
                    {translate('Recommended on {offering}: {amounts}', {
                      offering:
                        named[offeringUuid]?.offering ??
                        offeringNames[offeringUuid] ??
                        offeringUuid,
                      amounts:
                        named[offeringUuid]?.amounts ?? formatAmounts(amounts),
                    })}
                  </div>
                ))
              : translate('No resources recommended.')}
          </div>
          {ranking.notes ? (
            <div className="text-quaternary italic">
              {renderFieldOrDash(ranking.notes)}
            </div>
          ) : null}
        </div>
      </div>
      {editable && entries.length ? (
        <BaseButton
          label={translate('Prefill from recommendation')}
          variant="tertiary"
          onClick={prefill}
          disabled={prefilling || !patches.length}
          tooltip={
            !patches.length
              ? translate(
                  'The awarded amounts already match the recommendation.',
                )
              : undefined
          }
        />
      ) : null}
    </div>
  );
};
