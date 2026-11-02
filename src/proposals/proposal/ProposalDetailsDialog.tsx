import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  proposalPublicCallsRetrieve,
  type ProposalReview,
} from 'waldur-js-client';

import {
  PropertyItem,
  PropertyList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { usesCallVocabulary, showsCallContext } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';

import { EndingField } from '../EndingField';
import { ReviewDetails } from '../review/ReviewExpandableRow';

interface ProposalDetailsDialogProps {
  proposal: Proposal;
  // When opened in a review context (the dedicated review page), the reviewer's
  // review(s) are shown as "Review from X" tabs — the review page itself does
  // not surface the score/summary comments inline.
  reviews?: ProposalReview[];
}

export const ProposalDetailsDialog: FC<ProposalDetailsDialogProps> = ({
  proposal,
  reviews,
}) => {
  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['publicCall', proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({ path: { uuid: proposal.call_uuid } }).then(
        (r) => r.data,
      ),

    enabled: showsCallContext(),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  return (
    <ModalDialog
      title={
        usesCallVocabulary()
          ? translate('Proposal details overview')
          : translate('Request details overview')
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <Tabs
          mount="active"
          // The Call tab is value "1", but it does not render without call
          // context — leaving the default pointing at it opens the dialog with
          // nothing selected. Fall through to Round, then to the first review.
          defaultValue={
            showsCallContext() && call
              ? 'call'
              : showsCallContext()
                ? 'round'
                : `review-${(reviews ?? [])[0]?.uuid}`
          }
        >
          <TabsList>
            {call && showsCallContext() ? (
              <TabsTrigger value="call">{translate('Call')}</TabsTrigger>
            ) : null}
            {showsCallContext() ? (
              <TabsTrigger value="round">{translate('Round')}</TabsTrigger>
            ) : null}
            {(reviews ?? []).map((review) => (
              <TabsTrigger key={review.uuid} value={`review-${review.uuid}`}>
                {translate('Review from {name}', {
                  name:
                    review.reviewer_full_name || review.anonymous_reviewer_name,
                })}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="tab-content">
            {call && showsCallContext() ? (
              <TabsContent value="call">
                <PropertyList hideActions alignTop>
                  <PropertyItem
                    label={translate('Name')}
                    value={call.name}
                    hasCopy
                  />

                  <PropertyItem
                    label={translate('Reference code')}
                    value={(call as any).reference_code}
                    hasCopy
                  />
                </PropertyList>
              </TabsContent>
            ) : null}
            {showsCallContext() ? (
              <TabsContent value="round">
                <PropertyList hideActions alignTop>
                  <PropertyItem
                    label={translate('Cutoff date')}
                    value={
                      <EndingField
                        endDate={proposal.round.cutoff_time}
                        dateFirst
                      />
                    }
                    copyable={proposal.round.cutoff_time}
                  />
                </PropertyList>
              </TabsContent>
            ) : null}
            {(reviews ?? []).map((review) => (
              <TabsContent key={review.uuid} value={`review-${review.uuid}`}>
                <div className="pt-3">
                  <ReviewDetails review={review} />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </ModalDialog>
  );
};
