import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import {
  proposalPublicCallsRetrieve,
  type ProposalReview,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { FieldWithCopy } from '@/core/FieldWithCopy';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
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
          // The Call tab is eventKey 1, but it does not render without call
          // context — leaving the default pointing at it opens the dialog with
          // nothing selected. Fall through to Round, then to the first review.
          defaultActiveKey={
            showsCallContext() && call
              ? 1
              : showsCallContext()
                ? 2
                : `review-${(reviews ?? [])[0]?.uuid}`
          }
          unmountOnExit={true}
          className="nav-line-tabs"
        >
          {call && showsCallContext() ? (
            <Tab eventKey={1} title={translate('Call')}>
              <FormTable hideActions alignTop className="gy-5">
                <FormTable.Item
                  label={translate('Name')}
                  value={<FieldWithCopy value={call.name} />}
                />

                <FormTable.Item
                  label={translate('Reference code')}
                  value={<FieldWithCopy value={(call as any).reference_code} />}
                />
              </FormTable>
            </Tab>
          ) : null}
          {showsCallContext() ? (
            <Tab eventKey={2} title={translate('Round')}>
              <FormTable hideActions alignTop className="gy-5">
                <FormTable.Item
                  label={translate('Cutoff date')}
                  value={
                    <FieldWithCopy
                      value={
                        <EndingField
                          endDate={proposal.round.cutoff_time}
                          dateFirst
                        />
                      }
                    />
                  }
                />
              </FormTable>
            </Tab>
          ) : null}
          {(reviews ?? []).map((review) => (
            <Tab
              key={review.uuid}
              eventKey={`review-${review.uuid}`}
              title={translate('Review from {name}', {
                name:
                  review.reviewer_full_name || review.anonymous_reviewer_name,
              })}
            >
              <div className="pt-4">
                <ReviewDetails review={review} />
              </div>
            </Tab>
          ))}
        </Tabs>
      )}
    </ModalDialog>
  );
};
