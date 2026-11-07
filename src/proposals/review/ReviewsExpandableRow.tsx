import { useQuery } from '@tanstack/react-query';
import {
  proposalProposalsResourcesList,
  proposalProposalsRetrieve,
  ProposalReview,
  proposalReviewsRetrieve,
} from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { ReviewDetails } from './ReviewExpandableRow';

const loadProposalData = async (proposal_uuid: string) => {
  const proposal = await proposalProposalsRetrieve({
    path: { uuid: proposal_uuid },
  }).then((response) => response.data);

  const resources = await proposalProposalsResourcesList({
    path: { uuid: proposal_uuid },
  }).then((response) => response.data);

  const offeringNames = resources.map(
    (resource) => resource.requested_offering.offering_name,
  );

  return { proposal, offeringNames };
};

export const ReviewsExpandableRow = ({ row }: { row: ProposalReview }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proposal', row.proposal],
    queryFn: () => loadProposalData(row.proposal_uuid),
    refetchOnWindowFocus: false,
  });
  // The reviewer's own review, in full: list results leave out its comments.
  const { data: review } = useQuery({
    queryKey: ['ReviewDetail', row.uuid],
    queryFn: () =>
      proposalReviewsRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return translate('Unable to load data');
  }

  return (
    <ExpandableContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <div>
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('Applicant name')}
              value={data.proposal.created_by_name}
            />

            <PropertyItem
              label={translate('Submission date')}
              value={propVal.date(data.proposal.created, {
                precision: 'datetime',
              })}
            />

            {data.proposal.project && (
              <PropertyItem
                label={translate('Project')}
                value={data.proposal.project_name}
              />
            )}
            <PropertyItem
              label={translate('Offering')}
              value={propVal.list(data.offeringNames)}
            />
          </PropertyList>
        </div>
        <div>
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('Project summary')}
              value={data.proposal.project_summary}
            />
          </PropertyList>
        </div>
      </div>
      {review && (
        <div className="mt-5">
          <h6 className="mb-2.5">{translate('Your review')}</h6>
          <ReviewDetails review={review} />
        </div>
      )}
    </ExpandableContainer>
  );
};
